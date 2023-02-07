import type { OutputBundle, OutputOptions, Plugin, TransformResult } from "rollup";
import { CsLibBuilder } from "./csLibBuilder";
import { HooksParser, HooksParserResult } from "./hooksParser";

import { JsLibBuilder } from "./jsLibBuilder";
import { UnityCall } from "./unityCall";
import { UnityCallParser } from "./unityCallParser";

export interface JsLibOptions {
  rootFile?: string;
  rootClassName: string;
  jsLibFileName?: string;
  csFileName?: string;
  namespace?: string;
  methodPrefix?: string;
  bundleFileName?: string;
}

export declare function UCALL(methodName: string, arg: number | string): void;

var parserResult: HooksParserResult | null;
var jsLibRootClassFound = false;
export default function toUnityJsLib(options: JsLibOptions): Plugin {
  options = options ?? {};
  const jsLibFileName = options.jsLibFileName ?? "index";
  const csFileName = options.csFileName ?? "UnityJsLibHooks";
  const rootClassName = options.rootClassName ?? "UnityHooks";
  const jsNamespace = options.namespace ?? "_skJsLibEngine";
  const methodPrefix = options.methodPrefix ?? "SK_";
  const bundleFileName = options.bundleFileName ?? "index.js";
  const unityCalls: UnityCall[] = [];
  const classHeader = `class ${rootClassName}`;

  return {
    name: "toJsLib",
    async generateBundle(_: OutputOptions, bundle: OutputBundle) {
      if (!jsLibRootClassFound) {
        throw new Error(`[toUnityJs] Default class not found. Ensure that "export default ${classHeader}" exists."`);
      }

      if (!parserResult || parserResult.methods.length == 0) {
        throw new Error(
          `[toUnityJs] Not exportable methods found. Ensure that ${classHeader}" contains static methods."`
        );
      }

      let code = (bundle[bundleFileName] as any).code;
      let builder = new JsLibBuilder(jsNamespace, methodPrefix);
      code = builder.buildJsLib(code, parserResult.methods);
      this.emitFile({
        type: "asset",
        fileName: `${jsLibFileName}.jslib`,
        source: code,
      });

      let csBuilder = new CsLibBuilder(csFileName, methodPrefix);
      this.emitFile({
        type: "asset",
        fileName: `${csFileName}.cs`,
        source: csBuilder.buildCsClass(parserResult.methods, unityCalls),
      });
    },

    async transform(code: string, id: string) {
      const ucallParser = new UnityCallParser();
      if (code.includes(classHeader)) {
        const parser = new HooksParser();
        parserResult = parser.parse(code);
        jsLibRootClassFound = true;
      }

      const ucalls = ucallParser.collectUnityCalls(code);
      for (const c of ucalls) {
        unityCalls.push(c);
      }

      const result: TransformResult = {
        code: code,
      };
      return result;
    },

    buildStart() {
      jsLibRootClassFound = false;
      parserResult = null;
    },
  };
}

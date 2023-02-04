import type { OutputBundle, OutputOptions, Plugin, TransformResult } from "rollup";
import { CsLibBuilder } from "./csLibBuilder";
import { HooksParser, HooksParserResult } from "./hooksParser";

import { JsLibBuilder } from "./jsLibBuilder";

export interface JsLibOptions {
  rootFile?: string;
  rootClassName: string;
  jsLibFileName?: string;
  csFileName?: string;
  namespace?: string;
  methodPrefix?: string;
  bundleFileName?: string;
}

var parserResult: HooksParserResult;
export default function toUnityJsLib(options: JsLibOptions): Plugin {
  options = options ?? {};
  const jsLibFileName = options.jsLibFileName ?? "index";
  const csFileName = options.csFileName ?? "UnityJsLibHooks";
  const rootClassName = options.rootClassName ?? "UnityHooks";
  const jsNamespace = options.namespace ?? "_skJsLibEngine";
  const methodPrefix = options.methodPrefix ?? "SK_";
  const bundleFileName = options.bundleFileName ?? "index.js";
  return {
    name: "toJsLib",
    async generateBundle(outputOptions: OutputOptions, bundle: OutputBundle) {
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
        source: csBuilder.buildCsClass(parserResult.methods),
      });
    },

    async transform(code: string, id: string) {
      if (code.includes(`class ${rootClassName}`)) {
        const parser = new HooksParser();
        parserResult = parser.parse(code);
      }

      const result: TransformResult = {
        code: code,
      };
      return result;
    },
  };
}

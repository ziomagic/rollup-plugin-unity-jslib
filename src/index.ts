import type { OutputBundle, OutputOptions, Plugin, TransformResult } from "rollup";
import { CsLibBuilder } from "./csLibBuilder";
import { HooksParser, HooksParserResult } from "./hooksParser";

import { JsLibBuilder } from "./jsLibBuilder";
import { DebugLogger, EmptyLogger } from "./logger";
import { UnityCall } from "./unityCall";
import { UnityCallParser } from "./unityCallParser";

export interface CsOutputOptions {
  fileName: string;
  namespace?: null;
}

export interface JsLibOutputOptions {
  fileName: string;
  windowObjName: string;
}

export interface JsLibOptions {
  rootFile?: string;
  rootClassName: string;
  methodPrefix?: string;
  bundleFileName?: string;
  debug?: boolean;
  jsLibOutput?: JsLibOutputOptions;
  csOutput?: CsOutputOptions;
  useDynamicCall: boolean;
}

export declare function UCALL(methodName: string, arg: number | string): void;

var parserResult: HooksParserResult | null;
var jsLibRootClassFound = false;
export default function toUnityJsLib(options: JsLibOptions): Plugin {
  options = options ?? { useDynamicCall: false };
  options.csOutput ?? { fileName: "UnityJsLibHooks", namespace: null };
  options.jsLibOutput ?? { fileName: "index", windowObjName: "_skJsLibEngine" };

  const jsLibFileName = options.jsLibOutput?.fileName ?? "index";
  const jsNamespace = options.jsLibOutput?.windowObjName ?? "_skJsLibEngine";
  const csFileName = options.csOutput?.fileName ?? "UnityJsLibHooks";
  const csNamespace = options.csOutput?.namespace ?? null;
  const rootClassName = options.rootClassName ?? "UnityHooks";
  const methodPrefix = options.methodPrefix ?? "SK_";
  const bundleFileName = options.bundleFileName ?? "index.js";
  const useDynamicCall = options.useDynamicCall;
  const logger = options.debug ? new DebugLogger() : new EmptyLogger();

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
      let builder = new JsLibBuilder(logger, jsNamespace, methodPrefix, useDynamicCall);
      code = builder.buildJsLib(code, parserResult.methods);

      logger.log(`Producing output file ${jsLibFileName}.jslib`);
      this.emitFile({
        type: "asset",
        fileName: `${jsLibFileName}.jslib`,
        source: code,
      });

      logger.log(`Producing output file ${csFileName}.cs`);
      let csBuilder = new CsLibBuilder(csFileName, csNamespace, methodPrefix, useDynamicCall);
      this.emitFile({
        type: "asset",
        fileName: `${csFileName}.cs`,
        source: csBuilder.buildCsClass(parserResult.methods, unityCalls),
      });
    },

    async transform(code: string, id: string) {
      const ucallParser = new UnityCallParser(useDynamicCall);
      if (code.includes(classHeader)) {
        logger.log(`Parsing "${id}" root file`);

        const parser = new HooksParser(logger);
        parserResult = parser.parse(code);
        jsLibRootClassFound = true;
      }

      const ucalls = ucallParser.collectUnityCalls(code);
      for (const c of ucalls) {
        unityCalls.push(c);
        logger.log(`Unity Call found: ${c.methodName} - DYNCALL: ${c.dynamicCall}`);
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

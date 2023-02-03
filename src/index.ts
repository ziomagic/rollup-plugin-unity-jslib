import type { OutputBundle, OutputOptions, Plugin, TransformResult } from "rollup";
import { HooksParser, HooksParserResult } from "./hooksParser";

import { JsLibBuilder } from "./jsLibBuilder";

var parserResult: HooksParserResult;

export default function toUnityJsLib(): Plugin {
  return {
    name: "toJsLib",
    async generateBundle(options: OutputOptions, bundle: OutputBundle) {
      let code = (bundle["index.js"] as any).code;
      let builder = new JsLibBuilder();
      code = builder.buildJsLib(code, parserResult.methods);
      this.emitFile({
        type: "asset",
        fileName: "index.jslib",
        source: code,
      });
    },

    async transform(code: string, id: string) {
      if (code.includes("class UnityHooks")) {
        const parser = new HooksParser();
        parserResult = parser.parse(code);
        return null;
      }

      const result: TransformResult = {
        code: code,
      };
      return result;
    },
  };
}

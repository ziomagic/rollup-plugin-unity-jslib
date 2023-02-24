import { JsLibBuilder } from "../src/jsLibBuilder";
import { HookMethod, HookParameterType } from "../src/hookMethod";
import { EXEPECTED_JSLIB_DYNAMIC } from "./data/jslib.dyncall.expected";
import { EmptyLogger } from "../src/logger";

const replaceWhitespace = (str: string) => str.replace(/\s+/g, " ").trim();
//const replaceWhitespace = (str: string) => str;

describe("csLibBuilder", () => {
  let builder: JsLibBuilder;

  beforeEach(() => {
    builder = new JsLibBuilder(new EmptyLogger(), "_test", "TEST_", true);
  });

  it("Should generate JsLib code", () => {
    const methods: HookMethod[] = [
      {
        name: "sumIntegers",
        parameters: [
          {
            name: "x",
            type: HookParameterType.Number,
          },
          {
            name: "y",
            type: HookParameterType.Number,
          },
        ],
        returnType: HookParameterType.Number,
      },
      {
        name: "logObject",
        parameters: [
          {
            name: "logType",
            type: HookParameterType.String,
          },
          {
            name: "obj",
            type: HookParameterType.Object,
          },
        ],
        returnType: HookParameterType.Void,
      },
    ];

    const code = `(function () {
  'use strict';

  class UnityHooks {
      static sumIntegers(x, y) {
          return x + y;
      }
      static logObject(logType, obj) {
          console.log(obj);
          UCALL("Logged");
      }
  }

  return UnityHooks;

})();
`;

    const result = replaceWhitespace(builder.buildJsLib(code, methods));
    const expected = replaceWhitespace(EXEPECTED_JSLIB_DYNAMIC);
    expect(result).toBe(expected);
  });
});

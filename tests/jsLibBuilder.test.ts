import { JsLibBuilder } from "../src/jsLibBuilder";
import { HookMethod, HookParameterType } from "../src/hookMethod";
import { EXPECTED_JS_LIB as EXPECTED_JSLIB } from "./data/jslib.expected";

const replaceWhitespace = (str: string) => str.replace(/\s+/g, " ").trim();
//const replaceWhitespace = (str: string) => str;

describe("csLibBuilder", () => {
  let builder: JsLibBuilder;

  beforeEach(() => {
    builder = new JsLibBuilder("_test", "TEST_");
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
    const expected = replaceWhitespace(EXPECTED_JSLIB);
    expect(result).toBe(expected);
  });
});

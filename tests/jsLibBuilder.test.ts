import { JsLibBuilder } from "../src/jsLibBuilder";
import { HookMethod, HookParameterType } from "../src/hookMethod";
import { UnityCall } from "../src/unityCall";

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
    const expected = replaceWhitespace(expectedJsLibCode);
    expect(result).toBe(expected);
  });
});

const expectedJsLibCode = `
mergeInto(LibraryManager.library, {
  
TEST_init: function(gameObjNameStr) {
  const gameObjName = UTF8ToString(gameObjNameStr);
  const gInstance = window._unityInstance;

  window._test = (function () {
    'use strict';

    function UCALL(funcName, arg) {
      if(!window._unityInstance){
        console.log("Unity game instance could not be found. Please modify your index.html template.");
        return;
      }
    
      window._unityInstance.SendMessage(gameObjName, funcName, arg);
    }

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
  },
  TEST_sumIntegers: function(x, y) {
    return window._test.sumIntegers(x, y);
  },
  TEST_logObject: function(logType, obj) {
    window._test.logObject(UTF8ToString(logType), JSON.parse(UTF8ToString(obj)));
  },
})
`;

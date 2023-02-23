export const EXPECTED_JS_LIB = `
var _testModule = {
  $callbacks: {
    onDynamicCall: {}
  },

TEST_init: function(gameObjNameStr) {
  const gameObjName = UTF8ToString(gameObjNameStr);

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
};

autoAddDeps(_testModule, "$callbacks");
mergeInto(LibraryManager.library, _testModule);
`;

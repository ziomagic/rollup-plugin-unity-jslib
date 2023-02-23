export const EXEPECTED_JSLIB_DYNAMIC = `var _testModule = {
  $callbacks: {
    onDynamicCall: {}
  },

TEST_init: function(gameObjNameStr, onDynamicCall) {
  const gameObjName = UTF8ToString(gameObjNameStr);
  callbacks.onDynamicCall = onDynamicCall;
  window._test = (function () {
    'use strict';

    function UCALL(funcName, arg) {
      if(!window._unityInstance){
        console.log("Unity game instance could not be found. Please modify your index.html template.");
        return;
      }
    
      window._unityInstance.SendMessage(gameObjName, funcName, arg);
    }

    function DYNCALL(funcName, payload, data) {
      if (!(payload instanceof String)) {
        payload = JSON.stringify(payload);
      }
  
      if(!data) {
        data = new Uint8Array();
      }
      
      const payloadBufferSize = lengthBytesUTF8(payload) + 1;
      const payloadBuffer = _malloc(payloadBufferSize);
      stringToUTF8(payload, payloadBuffer, payloadBufferSize);
  
      const funcNameBufferSize = lengthBytesUTF8(funcName) + 1;
      const funcNameBuffer = _malloc(funcNameBufferSize);
      stringToUTF8(funcName, funcNameBuffer, funcNameBufferSize);
  
      const buffer = _malloc(data.length * data.BYTES_PER_ELEMENT);
      HEAPU8.set(data, buffer);
  
      Module.dynCall_viiiiii(
        callbacks.onDynamicCall,
        funcNameBuffer,
        funcNameBufferSize,
        payloadBuffer,
        payloadBufferSize,
        buffer,
        data.length
      );
  
      _free(payloadBuffer);
      _free(funcNameBuffer);
      _free(buffer);
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

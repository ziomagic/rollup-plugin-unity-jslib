import { HookMethod, HookParameter, HookParameterType } from "./hookMethod";

const template = `
var __LIBNAME__ = {
  $callbacks: {
    onDynamicCall: {}
  },

  __METHODS__
};

autoAddDeps(__LIBNAME__, "$callbacks");
mergeInto(LibraryManager.library, __LIBNAME__);
`;

export class JsLibBuilder {
  private namespace: string;
  private methodPrefix: string;
  private useDyncCall: boolean;
  private libName: string;

  constructor(namespace: string, methodPrefix: string, useDynCalls: boolean = false) {
    this.libName = namespace;
    this.namespace = "window." + namespace;
    this.methodPrefix = methodPrefix;
    this.useDyncCall = useDynCalls;
  }

  buildJsLib(code: string, methods: HookMethod[]) {
    let methodsStr = this.buildInitMethod(code);
    for (let m of methods) {
      const engineCall = `${this.namespace}.${m.name}${this.buildEngineCallParameters(m.parameters)};`;

      methodsStr += `${this.methodPrefix}${m.name}: function(${this.buildFunctionParameters(m.parameters)}) {\n`;
      methodsStr += this.buildFunctionCall(engineCall, m.returnType);
      methodsStr += "\n},\n";
    }

    let output = template.replace(/__LIBNAME__/g, `${this.libName}Module`).replace("__METHODS__", methodsStr);
    return output;
  }

  private buildInitMethod(code: string) {
    let uCallFuncCode = `function UCALL(funcName, arg) {
      if(!window._unityInstance){
        console.log("Unity game instance could not be found. Please modify your index.html template.");
        return;
      }
      
      window._unityInstance.SendMessage(gameObjName, funcName, arg);
    }`;

    if (this.useDyncCall) {
      uCallFuncCode += `
      \n
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
      `;
    }

    code = code.replace("'use strict';", "'use strict';\n\n" + uCallFuncCode);

    let initCode = `
    ${this.methodPrefix}init: function(gameObjNameStr) {
      const gameObjName = UTF8ToString(gameObjNameStr);
      ${this.namespace} = ${code}
    },
  `;

    if (this.useDyncCall) {
      initCode = `
      ${this.methodPrefix}init: function(gameObjNameStr, onDynamicCall) {
        const gameObjName = UTF8ToString(gameObjNameStr);
        callbacks.onDynamicCall = onDynamicCall;
        ${this.namespace} = ${code}
      },
    `;
    }

    return initCode;
  }

  private buildFunctionParameters(parameters: HookParameter[]) {
    let parametersStr = "";
    if (parameters) {
      parametersStr = parameters.map((x) => this.buildFunctionParam(x)).join(", ");
    }
    return `${parametersStr}`;
  }

  private buildFunctionParam(param: HookParameter) {
    if (param.type == HookParameterType.ByteArray) {
      return `${param.name}, ${param.name}Len`;
    }
    return param.name;
  }

  private buildEngineCallParameters(parameters: HookParameter[]) {
    let parametersStr = "";
    if (parameters) {
      parametersStr = parameters.map((x) => this.buildUnityVarCall(x)).join(", ");
    }
    return `(${parametersStr})`;
  }

  private buildUnityVarCall(param: HookParameter) {
    switch (param.type) {
      case HookParameterType.Number:
        return param.name;
      case HookParameterType.String:
        return `UTF8ToString(${param.name})`;
      case HookParameterType.ByteArray:
        return `HEAP8.subarray(${param.name}, ${param.name} + ${param.name}Len)`;
    }

    return `JSON.parse(UTF8ToString(${param.name}))`;
  }

  private buildFunctionCall(callStr: string, returnType: HookParameterType) {
    if (returnType == HookParameterType.Void) {
      return callStr;
    }

    if (returnType == HookParameterType.Number) {
      return `return ${callStr}`;
    }

    let output = `var result = ${callStr}\n`;
    if (returnType == HookParameterType.Object) {
      output += `result = JSON.stringify(result);\n`;
    }

    output += "var bs = lengthBytesUTF8(result);\n";
    output += "var buff = _malloc(bs);\n";
    output += "stringToUTF8(result, buff, bs);\n";
    output += "return buff;";
    return output;
  }
}

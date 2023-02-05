import { HookMethod, HookParameter, HookParameterType } from "./hookMethod";

const template = `
mergeInto(LibraryManager.library, {
  {{$methods}}
})
`;

export class JsLibBuilder {
  private namespace: string;
  private methodPrefix: string;

  constructor(namespace: string, methodPrefix: string) {
    this.namespace = "window." + namespace;
    this.methodPrefix = methodPrefix;
  }

  buildJsLib(code: string, methods: HookMethod[]) {
    let methodsStr = this.buildInitMethod(code);
    for (let m of methods) {
      const engineCall = `${this.namespace}.${m.name}${this.buildEngineCallParameters(m.parameters)};`;

      methodsStr += `${this.methodPrefix}${m.name}: function(${this.buildFunctionParameters(m.parameters)}) {\n`;
      methodsStr += this.buildFunctionCall(engineCall, m.returnType);
      methodsStr += "\n},\n";
    }

    let output = template.replace("{{$methods}}", methodsStr);
    return output;
  }

  private buildInitMethod(code: string) {
    const uCallFuncCode = `function UCALL(funcName, ...args) {
      if(!window._unityInstance){
        console.log(window._unityInstance);
        console.log("Unity game instance could not be found. Please modify your index.html template.");
        return;
      }
      
      const cArgs = [gameObjName, funcName, ...args];

      console.log(cArgs);
      window._unityInstance.SendMessage(...cArgs);
    }`;

    code = code.replace("'use strict';", "'use strict';\n\n" + uCallFuncCode);

    return `
    ${this.methodPrefix}init: function(gameObjNameStr) {
      const gameObjName = UTF8ToString(gameObjNameStr);
      const gInstance = window._unityInstance;

      ${this.namespace} = ${code};
    },
  `;
  }

  private buildFunctionParameters(parameters: HookParameter[]) {
    let parametersStr = "";
    if (parameters) {
      parametersStr = parameters.map((x) => x.name).join(", ");
    }
    return `${parametersStr}`;
  }

  private buildEngineCallParameters(parameters: HookParameter[]) {
    let parametersStr = "";
    if (parameters) {
      parametersStr = parameters.map((x) => this.buildUnityVarcall(x)).join(", ");
    }
    return `(${parametersStr})`;
  }

  private buildUnityVarcall(param: HookParameter) {
    switch (param.type) {
      case HookParameterType.Number:
        return param.name;
      case HookParameterType.String:
        return `UTF8ToString(${param.name})`;
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

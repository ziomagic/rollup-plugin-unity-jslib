import { HookMethod, HookParameter, HookParameterType } from "./hookMethod";

const template = `
mergeInto(LibraryManager.library, {
  init: function(gameObjnameStr) {
    var gameObjName = UTF8ToString(gameObjnameStr);
    window._skJsLibEngine = { 
      {{$code}}
    }
  }

  {{$methods}}
})
`;

const engineInvoker = "window._skJsLibEngine";

export class JsLibBuilder {
  buildJsLib(code: string, methods: HookMethod[]) {
    let methodsStr = "";
    for (let m of methods) {
      const engineCall = `${engineInvoker}.UnityRoot.${m.name}${this.buildEngineCallParameters(m.parameters)};`;

      methodsStr += m.name + `: function(${this.buildFunctionParameters(m.parameters)}) {\n`;
      methodsStr += this.buildFunctionCall(engineCall, m.returnType);
      methodsStr += "\n},\n";
    }

    let output = template.replace("{{$code}}", code);
    output = output.replace("{{$methods}}", methodsStr);
    return output;
  }

  private buildFunctionParameters(parameters: HookParameter[]) {
    let parametersStr = "";
    if (parameters) {
      parametersStr = parameters.map((x) => x.name).join(", ");
    }
    return `(${parametersStr})`;
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

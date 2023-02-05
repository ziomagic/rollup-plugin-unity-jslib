import { HookMethod, HookParameter, HookParameterType } from "./hookMethod";
import { UnityCall } from "./unityCall";

const template = `using UnityEngine;
using UnityEngine.Events;
using System.Runtime.InteropServices;

public class {{$className}} : MonoBehaviour {

  {{$methods}}
  {{$code}}
  {{$callbacks}}
}
`;

export class CsLibBuilder {
  private className: string;
  private methodPrefix: string;

  constructor(className: string, methodPrefix: string) {
    this.className = className;
    this.methodPrefix = methodPrefix;
  }

  buildCsClass(methods: HookMethod[], calls: UnityCall[]) {
    let methodsStr = this.buildInitMethod();
    for (let m of methods) {
      methodsStr += "\n";
      methodsStr += '[DllImport("__Internal")]';
      methodsStr += "\n";
      methodsStr += `private static extern ${this.buildReturnType(m.returnType)} ${this.methodPrefix}${
        m.name
      }${this.buildFunctionParameters(m.parameters)};`;
      methodsStr += "\n";
    }

    let codeStr = `private void Awake() 
    {
        ${this.methodPrefix}init(name);
    }`;
    for (let m of methods) {
      const methodName = m.name.charAt(0).toUpperCase() + m.name.slice(1);
      const returnType = this.buildReturnType(m.returnType);
      const functionParams = this.buildFunctionParameters(m.parameters);
      const returnKeyword = m.returnType == HookParameterType.Void ? "" : "return ";
      codeStr += "\n";
      codeStr += `public ${returnType} ${methodName}${functionParams} 
      {
        ${returnKeyword}${this.methodPrefix}${m.name}${this.buildFunctionCall(m.parameters)};
      }`;
    }

    let output = template
      .replace("{{$className}}", this.className)
      .replace("{{$methods}}", methodsStr)
      .replace("{{$code}}", codeStr)
      .replace("{{$callbacks}}", this.buildUnityCallbacks(calls));
    return output;
  }

  private buildInitMethod() {
    return `[DllImport("__Internal")]
    private static extern int ${this.methodPrefix}init(string name);
    `;
  }

  private buildFunctionParameters(parameters: HookParameter[]) {
    let parametersStr = "";
    if (parameters) {
      parametersStr = parameters.map((x) => this.buildParamCall(x)).join(", ");
    }
    return `(${parametersStr})`;
  }

  private buildFunctionCall(parameters: HookParameter[]) {
    let parametersStr = "";
    if (parameters) {
      parametersStr = parameters.map((x) => x.name).join(", ");
    }
    return `(${parametersStr})`;
  }

  private buildParamCall(param: HookParameter) {
    switch (param.type) {
      case HookParameterType.Number:
        return `int ${param.name}`;
      case HookParameterType.String:
        return `string ${param.name}`;
    }

    return `string ${param.name}`;
  }

  private buildReturnType(returnType: HookParameterType) {
    if (returnType == HookParameterType.Void) {
      return "void";
    }

    if (returnType == HookParameterType.Number) {
      return "int";
    }

    return "string";
  }

  private buildUnityCallbacks(calls: UnityCall[]) {
    let output = "";
    for (var c of calls) {
      if (c.parameterTypes.length > 0) {
        const parameters = c.parameterTypes.map((x) => this.buildReturnType(x)).join(", ");
        output += `\npublic UnityEvent<${parameters}> ${c.methodName}Event;`;
      } else {
        output += `\npublic UnityEvent ${c.methodName}Event;`;
      }
    }

    for (var c of calls) {
      const methodParams = c.parameterTypes.map((x) => this.buildReturnType(x) + " arg").join(", ");
      const execParams = c.parameterTypes.length > 0 ? "arg" : "";
      const eventName = c.methodName + "Event";
      output += `\npublic void ${c.methodName}(${methodParams})
      {
           if (${eventName} != null) { ${eventName}.Invoke(${execParams}); };
      }`;
    }

    return output;
  }
}

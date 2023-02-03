import { HookMethod, HookParameter, HookParameterType } from "./hookMethod";

const template = `
using UnityEngine;
using System.Runtime.InteropServices;

public class UnityJsLibHooks : MonoBehaviour {
{{$methods}}
}
`;

const engineInvoker = "window._skJsLibEngine";

export class CsLibBuilder {
  buildCsClass(methods: HookMethod[]) {
    let methodsStr = "";
    for (let m of methods) {
      methodsStr += "\n";
      methodsStr += '[DllImport("__Internal")]';
      methodsStr += "\n";
      methodsStr += `private static extern ${this.buildReturnType(m.returnType)} ${
        m.name
      }${this.buildFunctionParameters(m.parameters)};`;
      methodsStr += "\n";
    }

    let output = template.replace("{{$methods}}", methodsStr);
    return output;
  }

  private buildFunctionParameters(parameters: HookParameter[]) {
    let parametersStr = "";
    if (parameters) {
      parametersStr = parameters.map((x) => this.buildParamCall(x)).join(", ");
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
}

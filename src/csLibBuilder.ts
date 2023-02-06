import { CsCode } from "./csCode";
import { HookMethod, HookParameter, HookParameterType } from "./hookMethod";
import { UnityCall } from "./unityCall";

const template = `using UnityEngine;
using UnityEngine.Events;
using System.Runtime.InteropServices;

public class {{$className}} : MonoBehaviour 
{
{{$methods}}
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
    let cs = this.buildInitMethod();

    for (let m of methods) {
      const returnTypeStr = this.buildReturnType(m.returnType);
      const funcParamsStr = this.buildFunctionParameters(m.parameters);

      cs.addMethodHeader('[DllImport("__Internal")]');
      cs.addMethodHeader(`private static extern ${returnTypeStr} ${this.methodPrefix}${m.name}${funcParamsStr};`);
    }

    cs.addNewLine();

    cs.addMethodHeader("private void Awake()");
    cs.addMethodBody(`${this.methodPrefix}init(name);`);

    for (let m of methods) {
      const methodName = m.name.charAt(0).toUpperCase() + m.name.slice(1);
      const returnType = this.buildReturnType(m.returnType);
      const functionParams = this.buildFunctionParameters(m.parameters);
      const returnKeyword = m.returnType == HookParameterType.Void ? "" : "return ";

      cs.addMethodHeader(`public ${returnType} ${methodName}${functionParams}`);
      cs.addMethodBody(`${returnKeyword}${this.methodPrefix}${m.name}${this.buildFunctionCall(m.parameters)};`);
    }

    let output = template
      .replace("{{$className}}", this.className)
      .replace("{{$methods}}", cs.toString())
      .replace("{{$callbacks}}", this.buildUnityCallbacks(calls));
    return output;
  }

  private buildInitMethod() {
    let output = new CsCode();
    output.addMethodHeader('[DllImport("__Internal")]');
    output.addMethodHeader(`private static extern int ${this.methodPrefix}init(string name);`);
    return output;
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
    const output = new CsCode();

    for (var c of calls) {
      if (c.parameterTypes.length > 0) {
        const parameters = c.parameterTypes.map((x) => this.buildReturnType(x)).join(", ");
        output.addVariable(`public UnityEvent<${parameters}> ${c.methodName}Event;`);
      } else {
        output.addVariable(`public UnityEvent ${c.methodName}Event;`);
      }
    }

    for (var c of calls) {
      const methodParams = c.parameterTypes.map((x) => this.buildReturnType(x) + " arg").join(", ");
      const execParams = c.parameterTypes.length > 0 ? "arg" : "";
      const eventName = c.methodName + "Event";

      output.addMethodHeader(`public void ${c.methodName}(${methodParams})`);
      output.addMethodBody(`if (${eventName} != null) { ${eventName}.Invoke(${execParams}); }`);
    }

    return output.toString();
  }
}

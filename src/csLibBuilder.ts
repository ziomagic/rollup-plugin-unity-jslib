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
  private namespace: string | null;
  private methodPrefix: string;
  private useDynamicCall: boolean;

  constructor(className: string, namespace: string | null, methodPrefix: string, useDynamicCall: boolean) {
    this.className = className;
    this.namespace = namespace;
    this.methodPrefix = methodPrefix;
    this.useDynamicCall = useDynamicCall;
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

    cs.addMethodHeader("#if !UNITY_EDITOR");
    cs.addMethodHeader("private void Awake()");
    if (this.useDynamicCall) {
      cs.addMethodBody(`${this.methodPrefix}init(name, ${this.methodPrefix}OnDynamicCall);`);
    } else {
      cs.addMethodBody(`${this.methodPrefix}init(name);`);
    }
    cs.addMethodHeader("#endif");

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

    if (this.namespace) {
      output = CsCode.addNamespace(output, this.namespace);
    }
    return output;
  }

  private buildInitMethod() {
    let output = new CsCode();

    if (this.useDynamicCall) {
      output.addMethodHeader('[DllImport("__Internal")]');
      output.addMethodHeader(
        `private static extern int ${this.methodPrefix}init(string name, System.Action<byte[], int, byte[], int, byte[], int> onBytes);`
      );

      return output;
    }

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
    const mapParameter = (param: HookParameter) => {
      if (param.type == HookParameterType.ByteArray) {
        return `${param.name}, ${param.name}Len`;
      }

      return param.name;
    };

    if (parameters) {
      parametersStr = parameters.map((x) => mapParameter(x)).join(", ");
    }
    return `(${parametersStr})`;
  }

  private buildParamCall(param: HookParameter) {
    switch (param.type) {
      case HookParameterType.Number:
        return `int ${param.name}`;
      case HookParameterType.String:
        return `string ${param.name}`;
      case HookParameterType.ByteArray:
        return `byte[] ${param.name}, int ${param.name}Len`;
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

    if (returnType == HookParameterType.ByteArray) {
      return "byte[]";
    }

    return "string";
  }

  private buildUnityCallbacks(calls: UnityCall[]) {
    const output = new CsCode();
    const eventsProduced = new Set<string>();
    const methodsProduced = new Set<string>();
    const dynCallProduced = new Set<string>();

    for (var c of calls) {
      if (eventsProduced.has(c.methodName)) {
        continue;
      }
      eventsProduced.add(c.methodName);

      const hasParameters = c.parameterTypes.length > 0;
      const parameters = c.parameterTypes.map((x) => this.buildReturnType(x)).join(", ");
      const modifier = c.dynamicCall ? "public static" : "public";
      const eventStr = hasParameters ? `UnityEvent<${parameters}>` : `UnityEvent`;

      output.addVariable(`${modifier} ${eventStr} ${c.methodName}Event = new ${eventStr}();`);
    }

    for (var c of calls.filter((x) => !x.dynamicCall)) {
      if (methodsProduced.has(c.methodName)) {
        continue;
      }

      methodsProduced.add(c.methodName);

      const methodParams = c.parameterTypes.map((x) => this.buildReturnType(x) + " arg").join(", ");
      const execParams = c.parameterTypes.length > 0 ? "arg" : "";
      const eventName = c.methodName + "Event";

      output.addMethodHeader(`public void ${c.methodName}(${methodParams})`);
      output.addMethodBody(`if (${eventName} != null) { ${eventName}.Invoke(${execParams}); }`);
    }

    if (this.useDynamicCall) {
      output.addMethodHeader(`
      [AOT.MonoPInvokeCallback(typeof(System.Action<byte[], int, byte[], int, byte[], int>))]
      public static void ${this.methodPrefix}OnDynamicCall(
        [MarshalAs(UnmanagedType.LPArray, ArraySubType = UnmanagedType.U1, SizeParamIndex = 1)] byte[] funcNameBuff, int funcNameLen,
        [MarshalAs(UnmanagedType.LPArray, ArraySubType = UnmanagedType.U1, SizeParamIndex = 3)] byte[] payloadBuff, int payloadLen,
        [MarshalAs(UnmanagedType.LPArray, ArraySubType = UnmanagedType.U1, SizeParamIndex = 5)] byte[] buffer, int len)`);

      output.beginMethodBody();
      output.addCodeLine("var funcName = System.Text.Encoding.UTF8.GetString(funcNameBuff, 0, funcNameLen - 1);");
      output.addCodeLine("var payload = System.Text.Encoding.UTF8.GetString(payloadBuff, 0, payloadLen - 1);");

      for (var c of calls.filter((x) => x.dynamicCall)) {
        if (dynCallProduced.has(c.methodName)) {
          continue;
        }
        dynCallProduced.add(c.methodName);

        const eventName = c.methodName + "Event";

        output.addCodeLine(`if(funcName == "${c.methodName}")`);
        output.beginMethodBody();
        output.addCodeLine(`if (${eventName} != null) { ${eventName}.Invoke(payload, buffer); }`);
        output.addCodeLine("return;");
        output.endMethodBody();
      }
      output.endMethodBody();
    }

    return output.toString();
  }
}

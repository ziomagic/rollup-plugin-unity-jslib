import ts from "typescript";
import { HookParameterType } from "./hookMethod";
import { UnityCall } from "./unityCall";

export class UnityCallParser {
  public collectUnityCalls(code: string) {
    const match = code.match(/UCALL\(([^)]+)\)/g);
    if (!match) {
      return [];
    }

    const output: UnityCall[] = [];
    for (const m of match) {
      const calls = this.parseCallCode(m);
      for (const c of calls) {
        output.push(c);
      }
    }

    return output;
  }

  private parseCallCode(funcCode: string) {
    const s = ts.createSourceFile("", funcCode, ts.ScriptTarget.ES2015);
    const calls: UnityCall[] = [];
    s.forEachChild((x) => {
      const fd = x as ts.CallExpression;
      if (!fd) {
        return;
      }

      const exp = fd.expression as ts.CallExpression;
      if (!exp) {
        return;
      }

      const call = this.parseExpression(funcCode, exp);
      if (!call) {
        return;
      }

      calls.push(call);
    });

    return calls;
  }

  private parseExpression(code: string, exp: ts.CallExpression) {
    const call: UnityCall = {
      methodName: "",
      parameterTypes: [],
    };

    let i = 0;
    exp.arguments.forEach((arg) => {
      if (i++ > 0) {
        call.parameterTypes.push(this.toArgumentType(arg.kind));
        return;
      }

      if (arg.kind != ts.SyntaxKind.StringLiteral) {
        throw new Error("Invalid UCALL execution. First argument should be a string with Unity method name. \n" + code);
      }

      call.methodName = (arg as any).text;
    });

    return call;
  }

  private toArgumentType(tsKind: number) {
    switch (tsKind) {
      case ts.SyntaxKind.StringLiteral:
        return HookParameterType.String;
      case ts.SyntaxKind.NumericLiteral:
        return HookParameterType.Number;
    }

    throw new Error("Unhandler UCALL argument type " + tsKind);
  }
}

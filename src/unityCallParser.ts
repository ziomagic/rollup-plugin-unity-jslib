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

    if (exp.arguments.length < 1) {
      throw new Error("Invalid UCALL execution. Correc call: UCALL('FuncName', 'optionalVar'). \n" + code);
    }

    if (exp.arguments.length > 2) {
      throw new Error("Invalid UCALL execution. Correc call: UCALL('FuncName', 'optionalVar'). \n" + code);
    }

    const funcNameArg = exp.arguments[0];
    if (funcNameArg.kind != ts.SyntaxKind.StringLiteral) {
      throw new Error("Invalid UCALL execution. Correc call: UCALL('FuncName', 'optionalVar'). \n" + code);
    }

    call.methodName = (funcNameArg as any).text;

    if (exp.arguments.length > 1) {
      const variableArg = exp.arguments[1];

      call.parameterTypes.push(this.toArgumentType(variableArg.kind));
    }
    return call;
  }

  private toArgumentType(tsKind: number) {
    switch (tsKind) {
      case ts.SyntaxKind.StringLiteral:
      case ts.SyntaxKind.Identifier:
      case ts.SyntaxKind.CallExpression:
        return HookParameterType.String;
      case ts.SyntaxKind.NumericLiteral:
        return HookParameterType.Number;
    }

    throw new Error("Unhandler UCALL argument type " + tsKind);
  }
}

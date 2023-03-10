import ts from "typescript";
import { HookParameterType } from "./hookMethod";
import { UnityCall } from "./unityCall";

export class UnityCallParser {
  private _useDynCalls: boolean;

  constructor(useDynamicCalls: boolean) {
    this._useDynCalls = useDynamicCalls;
  }

  public collectUnityCalls(code: string) {
    const output: UnityCall[] = [];
    const match = code.match(/UCALL\(([^)]+)\)/g);
    if (match) {
      for (const m of match) {
        const calls = this.parseCallCode(m);
        for (const c of calls) {
          output.push(c);
        }
      }
    }

    const dynCallMatch = code.match(/DYNCALL\(([^)]+)\)/g);
    if (this._useDynCalls && dynCallMatch) {
      for (const m of dynCallMatch) {
        const calls = this.parseCallCode(m, true);
        for (const c of calls) {
          output.push(c);
        }
      }
    }

    this.validateCallList(output);
    return output;
  }

  private parseCallCode(funcCode: string, dynamicCall: boolean = false) {
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

      const call = dynamicCall ? this.parseDynCallExpression(funcCode, exp) : this.parseUCallExpression(funcCode, exp);
      if (!call) {
        return;
      }

      calls.push(call);
    });

    return calls;
  }

  private parseUCallExpression(code: string, exp: ts.CallExpression) {
    const call: UnityCall = {
      methodName: "",
      parameterTypes: [],
      dynamicCall: false,
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

  private parseDynCallExpression(code: string, exp: ts.CallExpression) {
    const call: UnityCall = {
      methodName: "",
      parameterTypes: [],
      dynamicCall: true,
    };

    if (exp.arguments.length < 1) {
      throw new Error("Invalid DYNCALL execution. Correc call: DYNCALL('FuncName', 'payload', 'buffer'). \n" + code);
    }

    if (exp.arguments.length > 3) {
      throw new Error("Invalid DYNCALL execution. Correc call: DYNCALL('FuncName', 'payload', 'buffer'). \n" + code);
    }

    const funcNameArg = exp.arguments[0];
    if (funcNameArg.kind != ts.SyntaxKind.StringLiteral) {
      throw new Error("Invalid DYNCALL execution. Correc call: DYNCALL('FuncName', 'payload', 'buffer'). \n" + code);
    }

    call.methodName = (funcNameArg as any).text;

    if (exp.arguments.length > 1) {
      const variableArg = exp.arguments[1];

      call.parameterTypes.push(this.toArgumentType(variableArg.kind));
      call.parameterTypes.push(HookParameterType.ByteArray);
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

  private validateCallList(calls: UnityCall[]) {
    for (const c of calls) {
      var sameMethodCalls = calls.filter((x) => x.methodName == c.methodName);
      if (sameMethodCalls.filter((x) => x.parameterTypes.length != c.parameterTypes.length).length > 0) {
        throw new Error(`UCALL(${c.methodName}) method was called with different parameters count.`);
      }
    }
  }
}

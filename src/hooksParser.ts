import ts from "typescript";
import { HookMethod, HookParameter, HookParameterType } from "./hookMethod";
import { IJsLibBuilderLogger } from "./logger";

export class HooksParserResult {
  methods: HookMethod[] = [];
}

export class HooksParser {
  private _source: ts.SourceFile | undefined;
  private logger: IJsLibBuilderLogger;

  constructor(logger: IJsLibBuilderLogger) {
    this.logger = logger;
  }

  parse(code: string): HooksParserResult {
    this._source = ts.createSourceFile("unityHooks.ts", code, ts.ScriptTarget.ES2015);
    let classNode = this.findClassNode();
    let result = new HooksParserResult();

    if (classNode == null) {
      console.log("No UnityHooks class found.");
      return result;
    }

    this.logger.log(`Parsing method hooks`);
    ts.forEachChild(classNode, (node) => {
      if (ts.isMethodDeclaration(node)) {
        const m = node as ts.MethodDeclaration;
        const isStatic = ts.getModifiers(m)?.some((x) => x.kind == ts.SyntaxKind.StaticKeyword);
        const mName = (m.name as any)?.escapedText;
        if (!isStatic) {
          console.warn("[toUnityJsLib] Skipped non static method - " + mName);
          return;
        }

        this.logger.log(`- Hook found: ${mName}`);

        const method = this.parseMethod(m);
        result.methods.push(method);
      }
    });

    return result;
  }

  private findClassNode() {
    let output: ts.Node | null = null;
    ts.forEachChild(this._source!, (node) => {
      if (ts.isClassDeclaration(node)) {
        const c = node as ts.ClassDeclaration;
        if (c.name?.escapedText == "UnityHooks") {
          output = c;
        }
      }
    });

    return output;
  }

  private parseMethod(m: ts.MethodDeclaration): HookMethod {
    const name = (m.name as any).escapedText;
    const parameters: HookParameter[] = [];
    for (var p of m.parameters) {
      const param = p as ts.ParameterDeclaration;
      parameters.push({
        name: (param.name as any)?.escapedText,
        type: this.parseParamType(param.type, HookParameterType.String),
      });
    }

    const returnType = this.parseParamType(m.type, HookParameterType.Void);
    return { name: name, parameters: parameters, returnType: returnType };
  }

  private parseParamType(type: ts.TypeNode | undefined, defaultType: HookParameterType) {
    if (!type) {
      return defaultType;
    }

    this.logger.log(`-- Parameter kind: ${ts.SyntaxKind[type.kind]} (${type.kind})`);

    const typeKind = type.kind;
    switch (typeKind) {
      case ts.SyntaxKind.NumberKeyword:
        return HookParameterType.Number;
      case ts.SyntaxKind.StringKeyword:
        return HookParameterType.String;
      case ts.SyntaxKind.ArrayType:
      case ts.SyntaxKind.TupleType:
        return HookParameterType.ByteArray;
      case ts.SyntaxKind.BooleanKeyword:
        return HookParameterType.Boolean;
    }

    return HookParameterType.Object;
  }
}

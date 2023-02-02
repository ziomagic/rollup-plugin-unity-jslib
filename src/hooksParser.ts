import ts from "typescript";

export class HooksParserResult {
  methods: any[] = [];
}

export class HooksParser {
  private _source: ts.SourceFile | undefined;

  parse(code: string): HooksParserResult {
    this._source = ts.createSourceFile("unityHooks.ts", code, ts.ScriptTarget.ES2015);
    let classNode = this.findClassNode();
    let result = new HooksParserResult();

    if (classNode == null) {
      console.log("No UnityHooks class found.");
      return result;
    }

    ts.forEachChild(classNode, (node) => {
      if (ts.isMethodDeclaration(node)) {
        const m = node as ts.MethodDeclaration;
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

  private parseMethod(m: ts.MethodDeclaration) {
    const name = (m.name as any).escapedText;

    for (var p of m.parameters) {
      const param = p as ts.ParameterDeclaration;
      if (ts.isVariableDeclaration(param)) {
        const v = param as ts.VariableDeclaration;
        console.log(v);
      }
    }

    return name;
  }
}

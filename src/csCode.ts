export class CsCode {
  private output: string;

  constructor() {
    this.output = "";
  }

  addMethodHeader(code: string) {
    this.output += code;
    this.output += "\n";
  }

  addMethodBody(code: string) {
    this.output += "{\n";
    this.output += code;
    this.output += "\n}\n\n";
  }

  addVariable(code: string) {
    this.output += code;
    this.output += "\n";
  }

  addNewLine() {
    this.output += "\n";
  }

  toString() {
    return this.output;
  }

  static addNamespace(code: string, namespace: string) {
    code = `namespace ${namespace}\n{\n` + code;
    code += "\n}";
    return code;
  }
}

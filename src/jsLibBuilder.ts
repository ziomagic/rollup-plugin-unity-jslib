import { HookMethod, HookParameter } from "./hookMethod";

const template = `
mergeInto(LibraryManager.library, {
  init: function() {
    window._skJsLibEngine = { 
      {{$code}}
    }
  }

  {{$methods}}
})
`;

const engineInvoker = "window._skJsLibEngine";

export class JsLibBuilder {
  buildJsLib(code: string, methods: HookMethod[]) {
    let methodsStr = "";
    for (let m of methods) {
      methodsStr += m.name + ": function() {\n" + engineInvoker + ".UnityRoot." + m.name;
      methodsStr += this.buildParameters(m.parameters) + "; \n},\n";
    }

    let output = template.replace("{{$code}}", code);
    output = output.replace("{{$methods}}", methodsStr);
    return output;
  }

  private buildParameters(parameters: HookParameter[]) {
    let parametersStr = "";
    if (parameters) {
      parametersStr = parameters.map((x) => x.name).join(", ");
    }
    return `(${parametersStr})`;
  }
}

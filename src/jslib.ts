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

export function mergeWithJslib(code: string, methods: any[]) {
  let methodsStr = "";
  for (let m of methods) {
    methodsStr += m + ": function() {\n" + engineInvoker + ".UnityRoot." + m + "; \n},\n";
  }

  let output = template.replace("{{$code}}", code);
  output = output.replace("{{$methods}}", methodsStr);
  return output;
}

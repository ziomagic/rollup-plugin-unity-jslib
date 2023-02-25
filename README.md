# rollup-plugin-unity-jslib

Rollup plugin for converting javascript library into Unity .jslib. file

## Example

```
import typescript from "rollup-plugin-typescript2";
import toUnityJsLib from "rollup-plugin-unity-jslib";
import copy from "rollup-plugin-copy";

const jsLibConfig = {
  debug: true,
  rootClassName: "UnityHooks",
  bundleFileName: "bundle.js",
  useDynamicCall: true,
  methodPrefix: "SK_FileBrowser_",
  jsLibOutput: {
    fileName: "SK_FileBrowser",
  },
  csOutput: {
    fileName: "SK_FileBrowserJsLib",
    namespace: "SK.FileBrowserWebGL",
  },
};

export default [
  {
    input: "./src/index.ts",
    output: {
      file: "./dist/bundle.js",
      format: "iife",
    },
    plugins: [toUnityJsLib(jsLibConfig), typescript()],
  },
];

```

It's important to use "rollup-plugin-typescript2" for transpillation .ts files for proper types detection.

Plugin supports only one output JS file, so be sure that your JS code will be bundled.

Plugin will generate output files: jsLibFileName.jslib, and csFileName.cs.
Calling Unity editor from JS can be done by calling `UCALL("methodName", "optional variable");` method.

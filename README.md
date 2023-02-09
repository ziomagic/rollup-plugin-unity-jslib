# rollup-plugin-unity-jslib

Rollup plugin for converting javascript library into Unity .jslib. file

## Example

```
import typescript from "@rollup/plugin-typescript";
import toUnityJsLib from "rollup-plugin-unity-jslib";

const jsLibConfig = {
  rootClassName: "UnityHooks",
  bundleFileName: "bundle.js",
  methodPrefix: "SK_GoogleIdentityServices_",
  csOutput: {
    fileName: "SK_GoogleIdentityServices",
    nameSpace: "SK_OneTap",
  },
};

export default {
  input: "./src/index.ts",
  output: {
    file: "./dist/bundle.js",
    format: "iife",
  },
  plugins: [toUnityJsLib(jsLibConfig), typescript()],
};

```

Plugin supports only one output JS file, so be sure that your JS code will be bundled.

Plugin will generate output files: jsLibFileName.jslib, and csFileName.cs.
Calling Unity editor from JS can be done by calling `UCALL("methodName", "optional variable");` method.

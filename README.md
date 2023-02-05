# rollup-plugin-unity-jslib

Rollup plugin for converting javascript library into Unity .jslib. file

## Example

```
import  typescript  from  "rollup-plugin-typescript2";
import  toUnityJsLib  from  "../out/index.es.mjs";

export  default {
input:  "./tests/test.ts",
output: [
    {
        exports:  "default",
        format:  "iife",
        file:  "tests/out/index.js",
    },
],

plugins: [toUnityJsLib(), typescript({ tsconfig:  "./tests/tsconfig.json" })],
};
```

Plugin supports only one output JS file, so be sure that your JS code will be bundled.

Plugin will generate output files: jsLibFileName.jslib, and csFileName.cs.
Calling Unity editor from JS can be done by calling `UCALL("methodName", "optional variable");` method.

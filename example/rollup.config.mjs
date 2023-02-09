import typescript from "rollup-plugin-typescript2";
import toUnityJsLib from "../out/index.es.mjs";

export default {
  input: "./example/example.ts",
  output: [
    {
      exports: "default",
      format: "iife",
      file: "example/out/index.js",
    },
  ],
  plugins: [toUnityJsLib({ csOutput: { namespace: "Kwi" } }), typescript({ tsconfig: "./example/tsconfig.json" })],
};

import typescript from "rollup-plugin-typescript2";
import toUnityJsLib from "../out/index.es.mjs";

export default {
  input: "./tests/test.ts",
  output: [
    {
      exports: "default",
      format: "iife",
      file: "tests/out/index.js",
    },
  ],
  plugins: [toUnityJsLib(), typescript({ tsconfig: "./tests/tsconfig.json" })],
};

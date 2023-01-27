import typescript from "rollup-plugin-typescript2";
import toUnityJsLib from "../out/index.es.mjs";

export default {
  input: "test.ts",
  output: [
    {
      exports: "default",
      file: "out/index.js",
    },
  ],
  plugins: [typescript(), toUnityJsLib()],
};

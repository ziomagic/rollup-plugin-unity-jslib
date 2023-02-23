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
  plugins: [
    toUnityJsLib({ useDynamicCall: true, csOutput: { namespace: "Kwo" } }),
    typescript({ tsconfig: "./example/tsconfig.json" }),
  ],
};

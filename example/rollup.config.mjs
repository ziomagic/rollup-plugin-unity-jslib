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
    toUnityJsLib({
      methodPrefix: "SKDYN_",
      useDynamicCall: true,
      csOutput: { namespace: "Kwo" },
      jsLibOutput: { windowObjName: "_skDynCall" },
    }),
    typescript({ tsconfig: "./example/tsconfig.json" }),
  ],
};

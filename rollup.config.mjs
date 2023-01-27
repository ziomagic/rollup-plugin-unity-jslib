import typescript from "rollup-plugin-typescript2";

export default {
  input: "index.ts",
  output: [
    {
      exports: "default",
      file: "out/index.es.mjs",
      format: "es",
    },
    {
      exports: "default",
      file: "out/index.cjs.js",
      format: "cjs",
    },
  ],
  plugins: [typescript()],
  external: ["fs", "path", "rollup-pluginutils"],
};

import type { OutputBundle, OutputOptions, Plugin } from "rollup";

export default function toUnityJsLib(): Plugin {
  return {
    name: "toJsLib",
    async generateBundle(options: OutputOptions, bundle: OutputBundle) {
      throw new Error("Not implemented yer");
    },
  };
}

import { CsLibBuilder } from "../src/csLibBuilder";
import { HookMethod, HookParameterType } from "../src/hookMethod";
import { UnityCall } from "../src/unityCall";
import { EXPECTED_CS } from "./data/cs.expected";

const replaceWhitespace = (str: string) => str.replace(/\s+/g, " ").trim();

describe("csLibBuilder", () => {
  let builder: CsLibBuilder;

  beforeEach(() => {
    builder = new CsLibBuilder("TestHook", null, "TEST_", false);
  });

  it("Should generate C# code", () => {
    const methods: HookMethod[] = [
      {
        name: "run",
        parameters: [
          {
            name: "fileName",
            type: HookParameterType.String,
          },
        ],
        returnType: HookParameterType.Number,
      },
      {
        name: "execute",
        parameters: [
          {
            name: "priority",
            type: HookParameterType.Number,
          },
          {
            name: "fileName",
            type: HookParameterType.String,
          },
        ],
        returnType: HookParameterType.Void,
      },
    ];

    const calls: UnityCall[] = [
      {
        methodName: "OnReady",
        parameterTypes: [HookParameterType.String],
      },
    ];

    const code = replaceWhitespace(builder.buildCsClass(methods, calls));

    const expected = replaceWhitespace(EXPECTED_CS);
    expect(code).toBe(expected);
  });
});

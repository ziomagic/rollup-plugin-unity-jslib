import { CsLibBuilder } from "../src/csLibBuilder";
import { HookMethod, HookParameterType } from "../src/hookMethod";
import { UnityCall } from "../src/unityCall";
import { EXPECTED_CS_DYNCALL } from "./data/cs.dyncall.expected";

const replaceWhitespace = (str: string) => str.replace(/\s+/g, " ").trim();

describe("csLibBuilder", () => {
  let builder: CsLibBuilder;

  beforeEach(() => {
    builder = new CsLibBuilder("TestHook", null, "TEST_", true);
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
    ];

    const calls: UnityCall[] = [
      {
        methodName: "OnDynamicCall",
        dynamicCall: true,
        parameterTypes: [HookParameterType.String, HookParameterType.ByteArray],
      },
      {
        methodName: "OnDynamicCallOther",
        dynamicCall: true,
        parameterTypes: [HookParameterType.String, HookParameterType.ByteArray],
      },
    ];

    const code = replaceWhitespace(builder.buildCsClass(methods, calls));

    const expected = replaceWhitespace(EXPECTED_CS_DYNCALL);
    expect(code).toBe(expected);
  });
});

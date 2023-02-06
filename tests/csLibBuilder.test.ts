import { CsLibBuilder } from "../src/csLibBuilder";
import { HookMethod, HookParameterType } from "../src/hookMethod";
import { UnityCall } from "../src/unityCall";

const replaceWhitespace = (str: string) => str.replace(/\s+/g, " ").trim();

describe("csLibBuilder", () => {
  let builder: CsLibBuilder;

  beforeEach(() => {
    builder = new CsLibBuilder("TestHook", "TEST_");
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

    const expected = replaceWhitespace(expectedCsCode);
    expect(code).toBe(expected);
  });
});

const expectedCsCode = `
using UnityEngine;
using UnityEngine.Events;
using System.Runtime.InteropServices;

public class TestHook : MonoBehaviour
{
[DllImport("__Internal")]
private static extern int TEST_init(string name);
[DllImport("__Internal")]
private static extern int TEST_run(string fileName);
[DllImport("__Internal")]
private static extern void TEST_execute(int priority, string fileName);

private void Awake()
{
TEST_init(name);
}

public int Run(string fileName)
{
return TEST_run(fileName);
}

public void Execute(int priority, string fileName)
{
TEST_execute(priority, fileName);
}


public UnityEvent<string> OnReadyEvent;
public void OnReady(string arg)
{
if (OnReadyEvent != null) { OnReadyEvent.Invoke(arg); }
}


}
`;

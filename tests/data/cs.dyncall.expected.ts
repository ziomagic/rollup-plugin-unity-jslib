export const EXPECTED_CS_DYNCALL = `
using UnityEngine;
using UnityEngine.Events;
using System.Runtime.InteropServices;

public class TestHook : MonoBehaviour
{
[DllImport("__Internal")]
private static extern int TEST_init(string name);
[DllImport("__Internal")]
private static extern int TEST_run(string fileName);

private void Awake()
{
TEST_init(name);
}

public int Run(string fileName)
{
return TEST_run(fileName);
}

public UnityEvent<string, byte[]> OnDynamicCallEvent;
public UnityEvent<string, byte[]> OnDynamicCallOtherEvent;

public static void OnDynamicCall(
    [MarshalAs(UnmanagedType.LPArray, ArraySubType = UnmanagedType.U1, SizeParamIndex = 1)] byte[] funcNameBuff, int funcNameLen,
    [MarshalAs(UnmanagedType.LPArray, ArraySubType = UnmanagedType.U1, SizeParamIndex = 3)] byte[] payloadBuff, int payloadLen,
    [MarshalAs(UnmanagedType.LPArray, ArraySubType = UnmanagedType.U1, SizeParamIndex = 5)] byte[] buffer, int len)
{
var funcName = System.Text.Encoding.UTF8.GetString(funcNameBuff);
var payload = System.Text.Encoding.UTF8.GetString(payloadBuff);
if(funcName == "OnDynamicCall")
{
if (OnDynamicCallEvent != null) { OnDynamicCallEvent.Invoke(payload, buffer); }
return;
}

if(funcName == "OnDynamicCallOther")
{
if (OnDynamicCallOtherEvent != null) { OnDynamicCallOtherEvent.Invoke(payload, buffer); }
return;
}
}

}
`;

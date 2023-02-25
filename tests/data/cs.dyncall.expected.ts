export const EXPECTED_CS_DYNCALL = `
using UnityEngine;
using UnityEngine.Events;
using System.Runtime.InteropServices;

public class TestHook : MonoBehaviour
{
[DllImport("__Internal")]
private static extern int TEST_init(string name, System.Action<byte[], int, byte[], int, byte[], int> onBytes);
[DllImport("__Internal")]
private static extern int TEST_run(string fileName);

#if !UNITY_EDITOR
private void Awake()
{
TEST_init(name, TEST_OnDynamicCall);
}
#endif

public int Run(string fileName)
{
return TEST_run(fileName);
}

public static UnityEvent<string, byte[]> OnDynamicCallEvent = new UnityEvent<string, byte[]>();
public static UnityEvent<string, byte[]> OnDynamicCallOtherEvent = new UnityEvent<string, byte[]>();

[AOT.MonoPInvokeCallback(typeof(System.Action<byte[], int, byte[], int, byte[], int>))]
public static void TEST_OnDynamicCall(
    [MarshalAs(UnmanagedType.LPArray, ArraySubType = UnmanagedType.U1, SizeParamIndex = 1)] byte[] funcNameBuff, int funcNameLen,
    [MarshalAs(UnmanagedType.LPArray, ArraySubType = UnmanagedType.U1, SizeParamIndex = 3)] byte[] payloadBuff, int payloadLen,
    [MarshalAs(UnmanagedType.LPArray, ArraySubType = UnmanagedType.U1, SizeParamIndex = 5)] byte[] buffer, int len)
{
var funcName = System.Text.Encoding.UTF8.GetString(funcNameBuff, 0, funcNameLen - 1);
var payload = System.Text.Encoding.UTF8.GetString(payloadBuff, 0, payloadLen - 1);
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

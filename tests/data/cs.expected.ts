export const EXPECTED_CS = `
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

#if !UNITY_EDITOR
private void Awake()
{
TEST_init(name);
}
#endif

public int Run(string fileName)
{
return TEST_run(fileName);
}

public void Execute(int priority, string fileName)
{
TEST_execute(priority, fileName);
}


public UnityEvent<string> OnReadyEvent = new UnityEvent<string>();
public void OnReady(string arg)
{
if (OnReadyEvent != null) { OnReadyEvent.Invoke(arg); }
}


}
`;

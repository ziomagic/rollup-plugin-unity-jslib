import { HookParameterType } from "./hookMethod";

export interface UnityCall {
  methodName: string;
  parameterTypes: HookParameterType[];
}

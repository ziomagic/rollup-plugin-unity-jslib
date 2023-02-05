import { HookParameterType } from "./hookMethod";

export function UCALL(method: string, ...args: any[]) {}

export interface UnityCall {
  methodName: string;
  parameterTypes: HookParameterType[];
}

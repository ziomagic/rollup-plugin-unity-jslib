import { DependentRoller, roll } from "./dependent";

var window: any;
export default class UnityHooks {
  static sumIntegers(x: number, y: number): number {
    return x + y;
  }

  static contactString(x: string, y: string): string {
    return x + y;
  }

  static alertString(str: string) {
    window.alert(str);
  }

  static logObject(logType: string, obj: DependentRoller) {
    console.log(obj);
  }
}

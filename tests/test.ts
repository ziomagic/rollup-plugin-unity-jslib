import { DependentRoller, roll } from "./dependent";

declare var alert: any;
export default class UnityHooks {
  static sumIntegers(x: number, y: number): number {
    return x + y;
  }

  static contactString(x: string, y: string): string {
    return x + y;
  }

  static alertString(str: string) {
    alert(str);
  }

  static logObject(logType: string, obj: DependentRoller) {
    console.log(obj);
  }

  static roll() {
    let roller = new DependentRoller();
    roller.methodRoll();
  }
}

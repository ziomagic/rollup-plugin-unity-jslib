import { DependentRoller, roll } from "./dependent";

declare var UCALL: any;
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
    UCALL("OnReady", 10);
  }

  static logObject(logType: string, obj: DependentRoller) {
    console.log(obj);
    UCALL("Logged");
  }

  static roll() {
    let roller = new DependentRoller();
    roller.methodRoll();
  }

  kwi() {
    console.log("aa");
  }
}

import { DependentRoller, roll } from "./dependent";

declare var UCALL: any;
declare var DYNCALL: any;
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

  static dynamicCall() {
    const obj = { x: 12, y: "siper" };
    DYNCALL("onDynamicCall", obj, null);
  }

  static dynamicCall2() {
    DYNCALL("onDynamicCall", "Kwiii", new Uint8Array([12, 12, 12]));
  }

  kwi() {
    console.log("aa");
  }
}

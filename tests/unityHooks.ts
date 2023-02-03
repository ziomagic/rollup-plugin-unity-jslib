import { DependentRoller } from "./dependent";

export class UnityHooks {
  static call() {}

  openWindow() {
    console.log("windo open");
  }

  withParameter(num: number, str: string, depten: DependentRoller) {
    console.log("parameters used" + num + str);
  }
}

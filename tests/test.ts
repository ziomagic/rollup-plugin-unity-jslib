import { DependentRoller, roll } from "./dependent";
import { UnityHooks } from "./unityHooks";

export default class UnityRoot {
  useSomething() {
    const obj = new DependentRoller();
    obj.methodRoll();
    UnityHooks.call();
  }

  useOtherThing() {
    roll();
  }
}

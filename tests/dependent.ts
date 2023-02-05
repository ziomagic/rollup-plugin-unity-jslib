declare var UCALL: any;
export function roll() {
  console.log("rolling");
}

export class DependentRoller {
  methodRoll() {
    roll();

    UCALL("OnFinished", 10, "KWII");
  }
}

declare var UCALL: any;
export function roll() {
  console.log("rolling");
}

export class DependentRoller {
  methodRoll() {
    roll();

    UCALL("OnFinished", "KWII");
  }

  methodOther() {
    const result = JSON.stringify(["Hej", "ho"]);
    UCALL("onSomething", result);
  }
}

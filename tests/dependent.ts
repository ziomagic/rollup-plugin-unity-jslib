export function roll() {
  console.log("rolling");
}

export class DependentRoller {
  methodRoll() {
    roll();
  }
}

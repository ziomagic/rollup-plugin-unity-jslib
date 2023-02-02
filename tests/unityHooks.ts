export class UnityHooks {
  static call() {}

  openWindow() {
    console.log("windo open");
  }

  withParameter(num: number, str: string) {
    console.log("parameters used" + num);
  }
}

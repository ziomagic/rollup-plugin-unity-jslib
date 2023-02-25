export interface IJsLibBuilderLogger {
  log(message: string): void;
}

export class EmptyLogger implements IJsLibBuilderLogger {
  log(_: string): void {}
}

export class DebugLogger implements IJsLibBuilderLogger {
  log(message: string) {
    console.log(message);
  }
}

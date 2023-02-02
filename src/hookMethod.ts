export interface HookMethod {
  name: string;
}

export interface HookParameter {
  name: string;
  type: HookParameterType;
}

export enum HookParameterType {
  String,
  Number,
  Object,
}

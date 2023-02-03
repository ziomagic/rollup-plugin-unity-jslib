export interface HookMethod {
  name: string;
  parameters: HookParameter[];
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

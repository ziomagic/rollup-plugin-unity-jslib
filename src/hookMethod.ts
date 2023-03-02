export interface HookMethod {
  name: string;
  parameters: HookParameter[];
  returnType: HookParameterType;
}

export interface HookParameter {
  name: string;
  type: HookParameterType;
}

export enum HookParameterType {
  String,
  Number,
  Object,
  Void,
  ByteArray,
  Boolean,
  InitCallback,
}

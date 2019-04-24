// Type definitions for @polyn/blueprint
// Project: https://github.com/losandes/polyn-blueprint
// Definitions by: Andy Wright <https://github.com/losandes>
// TypeScript Version: 2.1

/// <reference types="node" />

export interface IValueOrError {
  err: any | null;
  messages: string[] | null;
  value: any | null;
}

export interface IBlueprint {
  err: any | null;
  name: string;
  validate: (input: any) => IValueOrError
}

export interface IValidatorArg {
  key: string;
  value: any;
  input: any;
  root: any;
}

export function blueprint (name: string, blueprint: any): IBlueprint;
export function registerValidator (name: string, validator: Function): IValueOrError;
export function registerBlueprint (name: string, blueprint: IBlueprint): IValueOrError;

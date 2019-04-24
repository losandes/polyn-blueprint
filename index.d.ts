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
  validate: (input: any) => IValueOrError
}

export interface IPolynBlueprint {
  blueprint (name: string, blueprint: any): IBlueprint;
  registerValidator (name: string, validator: Function): IValueOrError
}

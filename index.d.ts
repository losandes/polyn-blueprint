// Type definitions for @polyn/blueprint
// Project: https://github.com/losandes/polyn-blueprint
// Definitions by: Andy Wright <https://github.com/losandes>
// TypeScript Version: 2.1

// blueprint ===================================================================

export interface IValueOrError {
  err: any | null;
  messages: string[] | null;
  value: any | null;
}

export interface IBlueprint {
  name: string;
  schema: any;
  validate: (input: any) => IValueOrError
}

export interface IValidationContext {
  key: string;
  value: any;
  input: any;
  root: any;
  schema: any;
}

/**
 * Deprecated - use IValidationContext instead
 */
export interface IValidatorArg extends IValidationContext {}

/**
 * Validation function that accepts the context being validated, and
 * either throws if invalid, returns boolean, or returns an IValueOrError
 * @param context - the value, and object being validated
 */
export type Validator = (context: IValidationContext) => IValueOrError | boolean;

/**
 * Returns a validator (fluent interface) for validating the input values
 * against the schema expectations
 * @param name - the name of the model being validated
 * @param schema - the type definitions
 * @param validate.input - the values being validated
 */
export function blueprint (name: string, schema: any): IBlueprint;

/**
 * Registers a validator by name, so it can be used in blueprints
 * @param name - the name of the validator
 * @param validator - the validator
 */
export function registerValidator (name: string, validator: Validator): Validator;

/**
 * Registers a validator, a nullable validator, an array validator, and
 * a nullable array validator based on the given name, using the
 * given validator function
 * @param name - the name of the type
 * @param validator - the validator for testing one instance of this type (must return truthy/falsey)
 * @returns object - { ${name}: validator, ${name}?: validator, ${name}[]: validator, ${name}[]?: validator }
 */
export function registerType (name: string, validator: Validator): any;

/**
 * Registers a blueprint that can be used as a validator
 * @param name - the name of the model being validated
 * @param schema - the type definitions
 */
export function registerBlueprint (name: string, schema: any): IBlueprint;

/**
 * Registers a regular expression validator by name, so it can be used in blueprints
 * @param name - the name of the validator
 * @param expression - the expression that will be  used to validate the values
 * @returns object - { ${name}: validator, ${name}?: validator, ${name}[]: validator, ${name}[]?: validator }
 */
export function registerExpression (name: string, expression: RegExp|string): any;

/**
 * Creates a validator that will verify that a value is greater than the
 * given minimum
 * @curried
 * @param min - the value that the input must be greater than
 * @param context - the value, and object being validated
 */
export function gt (min: number): (context: IValidationContext) => IValueOrError;

/**
 * Creates a validator that will verify that a value is greater than, or
 * equal to the given minimum
 * @curried
 * @param min - the value that the input must be greater than, or equal to
 * @param context - the value, and object being validated
 */
export function gte (min: number): (context: IValidationContext) => IValueOrError;

/**
 * Creates a validator that will verify that a value is less than the
 * given maximum
 * @curried
 * @param max - the value that the input must be less than
 * @param context - the value, and object being validated
 */
export function lt (max: number): (context: IValidationContext) => IValueOrError;

/**
 * Creates a validator that will verify that a value is less than, or
 * equal to the given minimum
 * @curried
 * @param max - the value that the input must be less than, or equal to
 * @param context - the value, and object being validated
 */
export function lte (max: number): (context: IValidationContext) => IValueOrError;

/**
 * Creates a validator that will verify that a value is between the
 * given boundaries. One of [`gt`|`gte`], and one of [`lt`|`lte`] are required.
 * @curried
 * @param range.gt - the value that the input must be greater than
 * @param range.gte - the value that the input must be greater than, or equal to
 * @param range.lt - the value that the input must be less than
 * @param range.lte - the value that the input must be less than, or equal to
 * @param context - the value, and object being validated
 */
export function range (range: {
  gt?: number;
  gte?: number;
  lt?: number;
  lte?: number;
}): (context: IValidationContext) => IValueOrError;

/**
 * Support for null, or undefined numeric comparators
 */
declare namespace optional {
  /**
   * Creates a validator that will verify that a value is greater than the
   * given minimum
   * @curried
   * @param min - the value that the input must be greater than
   * @param context - the value, and object being validated
   */
  function gt (min: number): (context: IValidationContext) => IValueOrError;

  /**
   * Creates a validator that will verify that a value is greater than, or
   * equal to the given minimum
   * @curried
   * @param min - the value that the input must be greater than, or equal to
   * @param context - the value, and object being validated
   */
  function gte (min: number): (context: IValidationContext) => IValueOrError;

  /**
   * Creates a validator that will verify that a value is less than the
   * given maximum
   * @curried
   * @param max - the value that the input must be less than
   * @param context - the value, and object being validated
   */
  function lt (max: number): (context: IValidationContext) => IValueOrError;

  /**
   * Creates a validator that will verify that a value is less than, or
   * equal to the given minimum
   * @curried
   * @param max - the value that the input must be less than, or equal to
   * @param context - the value, and object being validated
   */
  function lte (max: number): (context: IValidationContext) => IValueOrError;

  /**
   * Creates a validator that will verify that a value is between the
   * given boundaries. One of [`gt`|`gte`], and one of [`lt`|`lte`] are required.
   * @curried
   * @param range.gt - the value that the input must be greater than
   * @param range.gte - the value that the input must be greater than, or equal to
   * @param range.lt - the value that the input must be less than
   * @param range.lte - the value that the input must be less than, or equal to
   * @param context - the value, and object being validated
   */
  function range (range: {
    gt?: number;
    gte?: number;
    lt?: number;
    lte?: number;
  }): (context: IValidationContext) => IValueOrError;
}

/**
 * Support for null, or undefined registered, or functional comparators
 */
interface optional {
  (comparator: string | Validator | RegExp): (context: IValidationContext) => IValueOrError;
  withDefault (value: any): (context: IValidationContext) => IValueOrError;
}

declare function optional (comparator: string | Validator | RegExp): optional;


// is ==========================================================================

/**
 * Boolean type comparators
 */
declare namespace is {
  function getType (input: any): boolean;
  function defined (input?: any): boolean;
  function nullOrUndefined (input?: any): boolean;
  function func (input?: any): boolean;
  function object (input?: any): boolean;
  function array (input?: any): boolean;
  function string (input?: any): boolean;
  function boolean (input?: any): boolean;
  function date (input?: any): boolean;
  function regexp (input?: any): boolean;
  function number (input?: any): boolean;
  function nullOrWhitespace (input?: any): boolean;
  function decimal (input?: any, places?: number): boolean;

  namespace not {
    function getType (input: any): boolean;
    function defined (input?: any): boolean;
    function nullOrUndefined (input?: any): boolean;
    function func (input?: any): boolean;
    function object (input?: any): boolean;
    function array (input?: any): boolean;
    function string (input?: any): boolean;
    function boolean (input?: any): boolean;
    function date (input?: any): boolean;
    function regexp (input?: any): boolean;
    function number (input?: any): boolean;
    function nullOrWhitespace (input?: any): boolean;
    function decimal (input?: any, places?: number): boolean;
  }
}

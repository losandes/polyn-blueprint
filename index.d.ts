// Type definitions for @polyn/blueprint
// Project: https://github.com/losandes/polyn-blueprint
// Definitions by: Andy Wright <https://github.com/losandes>
// TypeScript Version: 2.1

// blueprint ===================================================================

/**
 * When Blueprint returns a value, or an error, it will always
 * guarantee IValueOrError, as opposed to boolean, or IOptionalValueOrError
 */
export interface IValueOrError<T = any> {
  /**
   * Blueprint.validate, and custom validators return either an
   * error, or a value, and may be accompanied by additional messages.
   */
  err?: any | null;
  /**
   * At least the err.message is available in this array.
   * Additional context may also be here. For instance, when
   * `validate` returns an error, the error message potentially
   * a concatenation of several validation errors. This messages
   * property will have each message on it's own, so you don't
   * have to split the err.message.
   */
  messages?: string[] | null;
  /**
   * Blueprint maps the values to `value` as it validates properties.
   * This will essentially be the same as the object that was passed
   * to `validate`, however any properties not on the schema will be
   * omitted, so this can be used as part of a strategy to mitigate
   * property pollution attacks.
   */
  value?: T | null;
}

export interface IBlueprint<T = any> {
  /**
   * The name of the model being validated
   */
  name: string;
  /**
   * The type definitions
   */
  schema: object;
  /**
   * Validates a given object against the schema
   */
  validate: (input: any) => IValueOrError<T>
}

export interface IValidationContext<T = any> {
  /**
   * The property name
   */
  key: string;
  /**
   * The value that is being validated for this property (i.e. `input[key]`)
   */
  value: T;
  /**
   * The object this property is on
   */
  input: any;
  /**
   * If the property being validated is on an object that is a
   * child of another object in the validation context, this will
   * be the top-most parent. Otherwise, it's the same as input.
   */
  root: any;
  /**
   * The current state of the `value` property for the `IValueOrError`
   * that is returned by `validate`. You can use this to validate
   * the values of other properties that were already processed, and
   * to mutate the output (the latter is not recommended).
   */
  output: any;
  /**
   * The schema for this validation context
   */
  schema: object;
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
  from (callback: (context: IValidationContext) => any): optional | ((context: IValidationContext) => IValueOrError);
  withDefault (value: any): (context: IValidationContext) => IValueOrError;
}

/**
 * Support for unpacking constructor input
 */
interface required {
  (comparator: string | Validator | RegExp): (context: IValidationContext) => IValueOrError;
  from (callback: (context: IValidationContext) => any): (context: IValidationContext) => IValueOrError;
}

declare function optional (comparator: string | Validator | RegExp): optional;
declare function required (comparator: string | Validator | RegExp): required;


// is ==========================================================================

/**
 * Boolean type comparators
 */
declare namespace is {
  function getType (input: any): string;
  function defined (input?: any): boolean;
  function nullOrUndefined (input?: any): boolean;
  function func (input?: any): boolean;
  function asyncFunc (input?: any): boolean;
  function promise (input?: any): boolean;
  function object (input?: any): boolean;
  function array (input?: any): boolean;
  function string (input?: any): boolean;
  function boolean (input?: any): boolean;
  function date (input?: any): boolean;
  function regexp (input?: any): boolean;
  function number (input?: any): boolean;
  function nullOrWhitespace (input?: any): boolean;
  function decimal (input?: any, places?: number): boolean;
  function primitive (input?: any): boolean;
  function arrayOf (type: string): (input?: any) => boolean;

  namespace not {
    function defined (input?: any): boolean;
    function nullOrUndefined (input?: any): boolean;
    function func (input?: any): boolean;
    function asyncFunc (input?: any): boolean;
    function promise (input?: any): boolean;
    function object (input?: any): boolean;
    function array (input?: any): boolean;
    function string (input?: any): boolean;
    function boolean (input?: any): boolean;
    function date (input?: any): boolean;
    function regexp (input?: any): boolean;
    function number (input?: any): boolean;
    function nullOrWhitespace (input?: any): boolean;
    function decimal (input?: any, places?: number): boolean;
    function primitive (input?: any): boolean;
    function arrayOf (type: string): (input?: any) => boolean;
  }
}

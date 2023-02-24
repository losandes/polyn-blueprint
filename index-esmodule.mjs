import cjsModule from './index.cjs'

export const blueprint = cjsModule.blueprint
export const registerValidator = cjsModule.registerValidator
export const registerType = cjsModule.registerType
export const registerBlueprint = cjsModule.registerBlueprint
export const registerExpression = cjsModule.registerExpression
export const gt = cjsModule.gt
export const gte = cjsModule.gte
export const lt = cjsModule.lt
export const lte = cjsModule.lte
export const range = cjsModule.range
export const optional = cjsModule.optional
export const required = cjsModule.required
export const is = cjsModule.is
export const getValidators = cjsModule.getValidators
export const getValidator = cjsModule.getValidator

export default {
  blueprint,
  registerValidator,
  registerType,
  registerBlueprint,
  registerExpression,
  gt,
  gte,
  lt,
  lte,
  range,
  optional,
  required,
  is,
  // the items below are unsupported and undocumented...
  // they might break or change without triggering a breaking release
  getValidators,
  getValidator,
}

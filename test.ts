// make sure tsc can build this
import {
  IValueOrError,
  IBlueprint,
  IValidatorArg,
  Validator,
  blueprint,
  registerValidator,
  registerType,
  registerBlueprint,
  registerExpression,
  gt, gte, lt, lte, range, optional,
  is
} from './index'

const isCharBool: Validator = (context: IValidatorArg): boolean => {
  return typeof context.value === 'string' && context.value.length === 1
}

const isCharVal: Validator = (context: IValidatorArg): IValueOrError => {
  if (typeof context.value === 'string' && context.value.length === 1) {
    return {
      err: null,
      messages: null,
      value: context.value
    }
  }

  return {
    err: new Error('BOOM!'),
    messages: ['BOOM!'],
    value: context.value
  }
}

const registrations: IValueOrError[] = [
  registerValidator('oneChar', isCharBool),
  registerValidator('oneChar2', isCharVal),
  registerType('char', isCharBool),
  registerType('char2', isCharVal)
]

registrations.forEach((reg) => {
  if (reg.err) {
    throw reg.err
  }
})

const myCharsBp: IBlueprint = blueprint('myChars', {
  a: 'oneChar',
  b: 'oneChar2',
  c: 'char',
  d: 'char2'
})

registrations.push(registerBlueprint('myChars', myCharsBp))
registrations.push(registerExpression('productType', /^book|movie$/))

registrations.forEach((reg) => {
  if (reg.err) {
    throw reg.err
  }
})

const myModelBp: IBlueprint = blueprint('myModel', {
  prop1: 'string',
  prop2: 'number',
  prop3: 'myChars',
  prop4: 'productType',
  gt: gt(20),
  gte: gte(20),
  lt: lt(20),
  lte: lte(20),
  range: range({ gt: 10, lt: 20 }),
  maybeGt: optional.gt(20),
  maybeGte: optional.gte(20),
  maybeLt: optional.lt(20),
  maybeLte: optional.lte(20),
  maybeRange: optional.range({ gt: 10, lt: 20 })
})


const result: IValueOrError = myModelBp.validate({
  prop1: 'hello world!',
  prop2: 42,
  prop3: {
    a: 'a',
    b: 'b',
    c: 'c',
    d: 'd'
  },
  prop4: 'book'
})

if (result.err) {
  throw result.err
}

console.log({
  assert: `is.string('str')`,
  expected: true,
  actual: is.string('str')
})

console.log({
  assert: `is.not.string(1)`,
  expected: true,
  actual: is.string(1)
})

console.log({
  assert: `is.function('str')`,
  expected: false,
  actual: is.function('str')
})

console.log({
  assert: `is.not.function(1)`,
  expected: false,
  actual: is.function(1)
})

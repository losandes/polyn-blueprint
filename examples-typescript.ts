// make sure tsc can build this
import { expect } from 'chai'
import {
  IValueOrError,
  IBlueprint,
  IValidationContext,
  Validator,
  blueprint,
  registerValidator,
  registerType,
  registerBlueprint,
  registerExpression,
  optional,
  gt, gte, lt, lte, range,
  is
} from '.'

;(() => {
  expect(is.string('str'), `is.string('str') should work`).to.equal(true)
  expect(is.not.string(1), `is.not.string(1) should work`).to.equal(true)
  expect(is.func(() => true), `is.func(() => true should work`).to.equal(true)
  expect(is.not.func('str'), `is.not.func('str') should work`).to.equal(true)
})()

;(() => {
  const isCharBool: Validator = (context: IValidationContext): boolean => {
    return typeof context.value === 'string' && context.value.length === 1
  }

  const isCharVal: Validator = (context: IValidationContext): IValueOrError => {
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

  registerValidator('oneChar', isCharBool),
  registerValidator('oneChar2', isCharVal),
  registerType('char', isCharBool),
  registerType('char2', isCharVal)
  registerExpression('productType', /^book|movie$/)

  const myCharsBp: IBlueprint = registerBlueprint('myChars', {
    a: 'oneChar',
    b: 'oneChar2',
    c: 'char',
    d: 'char2'
  })

  expect(myCharsBp.name).to.equal('myChars')

  const myModelBp: IBlueprint = blueprint('myModel', {
    prop1: 'string',
    prop2: 'number',
    prop3: 'myChars',
    prop4: 'productType',
    prop5: 'oneChar',
    prop6: 'oneChar2',
    prop7: 'char',
    prop8: 'char2',
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

  expect(myModelBp.name).to.equal('myModel')

  const result: IValueOrError = myModelBp.validate({
    prop1: 'hello world!',
    prop2: 42,
    prop3: {
      a: 'a',
      b: 'b',
      c: 'c',
      d: 'd'
    },
    prop4: 'book',
    prop5: 'a',
    prop6: 'b',
    prop7: 'c',
    prop8: 'd',
    gt: 21,
    gte: 21,
    lt: 19,
    lte: 19,
    range: 15,
    maybeGt: null,
    maybeGte: undefined,
    maybeLt: null,
    maybeLte: undefined,
    maybeRange: null
  })

  expect(result.err).to.be.null
})()

;(() => {
  // Exploring `optional`
  const optionalValues = blueprint('optionalValues', {
    stringOrDefault: optional('string').withDefault('foo'),
    maybeGt20: optional(gt(20)),
    gt20OrDefault: optional(gt(20)).withDefault(42),
    maybeEnum: optional(/^book|magazine$/),
    enumOrDefault: optional(/^book|magazine|product$/).withDefault('product'),
    maybeCustom: optional(({ value }) => typeof value === 'string')
      .withDefault('custom')
  })

  const result = optionalValues.validate({});

  expect(result.err).to.be.null
  expect(result.value).to.deep.equal({
    stringOrDefault: 'foo',
    maybeGt20: undefined,
    gt20OrDefault: 42,
    maybeEnum: undefined,
    enumOrDefault: 'product',
    maybeCustom: 'custom'
  })
})()

;(() => {
  // Strictly Typed IValueOrError
  interface IAmValidationType {
    prop1: string;
    prop2: number;
  }

  interface IHaveValidationType {
    validationType: IAmValidationType;
  }

  const bp: IBlueprint<IHaveValidationType> = blueprint('typedValidation', {
    validationType: (
      { value }: IValidationContext<IAmValidationType>
    ): IValueOrError<IAmValidationType> => {
      if (value && is.string(value.prop1) && is.number(value.prop2)) {
        return { value, err: null, messages: null };
      }
      return { value: null, err: new Error('Boom!'), messages: null };
    }
  });

  const expected = {
    validationType: {
      prop1: 'hello',
      prop2: 42
    }
  };

  expect(bp.validate(expected).value).to.deep.equal(expected);
  expect(bp.validate({}).err).to.not.be.null;
})()

console.log('\x1b[32mALL TYPESCRIPT EXAMPLES PASSED\x1b[0m\n');

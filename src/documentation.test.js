/* eslint-disable no-console */
module.exports = (test) => {
  return test('given `blueprint` documentation', {
    '## Types / Validators': {
      given: () => { // documentation
        const {
          blueprint,
          gt, gte, lt, lte, range,
        } = require('@polyn/blueprint')

        const allTheTypes = blueprint('allTheTypes', {
          // strings
          requiredString: 'string',
          optionalString: 'string?',
          requiredArrayOfStrings: 'string[]',
          optionalArrayOfStrings: 'string[]?',

          // numbers
          requiredNumber: 'number',
          optionalNumber: 'number?',
          requiredArrayOfNumbers: 'number[]',
          optionalArrayOfNumbers: 'number[]?',
          gt10: gt(10),
          gte10: gte(10),
          lt10: lt(10),
          lte10: lte(10),
          between10And20: range({ gte: 10, lte: 20 }), // supports gt, gte, lt, lte

          // booleans
          requiredBoolean: 'boolean',
          optionalBoolean: 'boolean?',
          requiredArrayOfBooleans: 'boolean[]',
          optionalArrayOfBooleans: 'boolean[]?',

          // dates
          requiredDate: 'date',
          optionalDate: 'date?',
          requiredArrayOfDates: 'date[]',
          optionalArrayOfDates: 'date[]?',

          // regular expressions as values
          requiredRegExp: 'regexp',
          optionalRegExp: 'regexp?',
          requiredArrayOfRegExps: 'regexp[]',
          optionalArrayOfRegExps: 'regexp[]?',

          // regular expressions as validators
          requiredEnum: /^book|magazine$/,

          // functions
          requiredFunction: 'function',
          optionalFunction: 'function?',
          requiredArrayOfFunctions: 'function[]',
          optionalArrayOfFunctions: 'function[]?',

          // async functions / promises (validation is the same)
          requiredAsyncFunction: 'asyncFunction',
          optionalAsyncFunction: 'asyncFunction?',
          requiredArrayOfAsyncFunctions: 'asyncFunction[]',
          optionalArrayOfAsyncFunctions: 'asyncFunction[]?',
          requiredAsyncPromise: 'promise',
          optionalAsyncPromise: 'promise?',
          requiredArrayOfAsyncPromises: 'promise[]',
          optionalArrayOfAsyncPromises: 'promise[]?',

          // objects
          requiredObject: 'object',
          optionalObject: 'object?',
          requiredArrayOfObjects: 'object[]',
          optionalArrayOfObjects: 'object[]?',

          // any
          requiredAny: 'any',
          optionalAny: 'any?',
          requiredArrayOfAny: 'any[]',
          optionalArrayOfAny: 'any[]?',

          // weakly typed arrays
          requiredArray: 'array', // same as any[]
          optionalArray: 'array?', // same as any[]?

          // decimals
          requiredDecimal: 'decimal',
          optionalDecimal: 'decimal?',
          requiredArrayOfDecimals: 'decimal[]',
          optionalArrayOfDecimals: 'decimal[]?',

          // decimal places (up to 15 decimal places)
          requiredDecimalTo1Place: 'decimal:1',
          optionalDecimalTo1Place: 'decimal:1?',
          requiredDecimalTo15Places: 'decimal:15',
          optionalDecimalTo15Places: 'decimal:15?',

          requiredPrimitive: 'primitive',
          optionalPrimitive: 'primitive?',
          requiredArrayOfPrimitives: 'primitive[]',
          optionalArrayOfPrimitives: 'primitive[]?',

          // inline custom validators
          someProperty: ({ key, value, input, root }) =>
            root.productType === 'book' && typeof value === 'string',
        })

        return allTheTypes
      }, // /given
      when: () => {}, // remove this when supposed is upgraded
      'when the documentation is excercised with all values being set': {
        when: (allTheTypes) => {
          return allTheTypes.validate({
            // strings
            requiredString: 'string',
            optionalString: 'string?',
            requiredArrayOfStrings: ['string', 'string'],
            optionalArrayOfStrings: ['string', 'string'],

            // numbers
            requiredNumber: 42,
            optionalNumber: 42,
            requiredArrayOfNumbers: [1, 2],
            optionalArrayOfNumbers: [1, 2],
            gt10: 11,
            gte10: 10,
            lt10: 9,
            lte10: 10,
            between10And20: 15,

            // booleans
            requiredBoolean: true,
            optionalBoolean: false,
            requiredArrayOfBooleans: [true, false],
            optionalArrayOfBooleans: [true, false],

            // dates
            requiredDate: new Date(),
            optionalDate: new Date(),
            requiredArrayOfDates: [new Date(), new Date()],
            optionalArrayOfDates: [new Date(), new Date()],

            // regular expressions as values
            requiredRegExp: /^foo$/,
            optionalRegExp: /^foo$/,
            requiredArrayOfRegExps: [/^foo$/, /^bar$/],
            optionalArrayOfRegExps: [/^foo$/, /^bar$/],

            // regular expressions as validators
            requiredEnum: 'book',

            // functions
            requiredFunction: function () {},
            optionalFunction: () => {},
            requiredArrayOfFunctions: [function () {}, () => {}, async () => {}],
            optionalArrayOfFunctions: [function () {}, () => {}, async () => {}],

            // async functions / promises (validation is the same)
            requiredAsyncFunction: async function () {},
            optionalAsyncFunction: async () => {},
            requiredArrayOfAsyncFunctions: [async function () {}, async () => {}],
            optionalArrayOfAsyncFunctions: [async function () {}, async () => {}],
            requiredAsyncPromise: Promise.resolve(),
            optionalAsyncPromise: Promise.resolve(),
            requiredArrayOfAsyncPromises: [Promise.resolve(), Promise.resolve()],
            optionalArrayOfAsyncPromises: [Promise.resolve(), Promise.resolve()],

            // objects
            requiredObject: {},
            optionalObject: {},
            requiredArrayOfObjects: [{}, {}],
            optionalArrayOfObjects: [{}, {}],

            // any
            requiredAny: {},
            optionalAny: 42,
            requiredArrayOfAny: [{}, 42, 'string'], // [{}, 42, 'string', null, undefined],
            optionalArrayOfAny: [{}, 42, 'string'], // [{}, 42, 'string', null, undefined],

            // weakly typed arrays
            requiredArray: [],
            optionalArray: [],

            // decimals
            requiredDecimal: 42.1,
            optionalDecimal: 42.24,
            requiredArrayOfDecimals: [42.1, 42.24],
            optionalArrayOfDecimals: [42.1, 42.24],

            // decimal places (up to 15 decimal places)
            requiredDecimalTo1Place: 42.1,
            optionalDecimalTo1Place: 42.2,
            requiredDecimalTo15Places: 42.123456789012345, // eslint-disable-line no-loss-of-precision
            optionalDecimalTo15Places: 42.123456789012345, // eslint-disable-line no-loss-of-precision

            requiredPrimitive: 'primitive',
            optionalPrimitive: 42,
            requiredArrayOfPrimitives: ['string', 42, 41n, true, null, undefined, Symbol('string')],
            optionalArrayOfPrimitives: ['string', 42, 41n, true, null, undefined, Symbol('string')],

            // inline custom validators
            productType: 'book',
            someProperty: 'Swamplandia',
          })
        },
        'the documentation should be valid': (expect) => (err, actual) => {
          expect(err).to.equal(null)
          expect(actual.err).to.equal(null)
        }, // /then
      }, // /when allWithValues
      'when the documentation is exercised with optional values being undefined': {
        when: (allTheTypes) => {
          return allTheTypes.validate({
            // strings
            requiredString: 'string',
            optionalString: undefined,
            requiredArrayOfStrings: ['string', 'string'],
            optionalArrayOfStrings: undefined,

            // numbers
            requiredNumber: 42,
            optionalNumber: undefined,
            requiredArrayOfNumbers: [1, 2],
            optionalArrayOfNumbers: undefined,
            gt10: 11,
            gte10: 10,
            lt10: 9,
            lte10: 10,
            between10And20: 15,

            // booleans
            requiredBoolean: true,
            optionalBoolean: undefined,
            requiredArrayOfBooleans: [true, false],
            optionalArrayOfBooleans: undefined,

            // dates
            requiredDate: new Date(),
            optionalDate: undefined,
            requiredArrayOfDates: [new Date(), new Date()],
            optionalArrayOfDates: undefined,

            // regular expressions as values
            requiredRegExp: /^foo$/,
            optionalRegExp: undefined,
            requiredArrayOfRegExps: [/^foo$/, /^bar$/],
            optionalArrayOfRegExps: undefined,

            // regular expressions as validators
            requiredEnum: 'book',

            // functions
            requiredFunction: function () {},
            optionalFunction: undefined,
            requiredArrayOfFunctions: [function () {}, () => {}, async () => {}],
            optionalArrayOfFunctions: undefined,

            // async functions / promises (validation is the same)
            requiredAsyncFunction: async function () {},
            optionalAsyncFunction: undefined,
            requiredArrayOfAsyncFunctions: [async function () {}, async () => {}],
            optionalArrayOfAsyncFunctions: undefined,
            requiredAsyncPromise: Promise.resolve(),
            optionalAsyncPromise: undefined,
            requiredArrayOfAsyncPromises: [Promise.resolve(), Promise.resolve()],
            optionalArrayOfAsyncPromises: undefined,

            // objects
            requiredObject: {},
            optionalObject: undefined,
            requiredArrayOfObjects: [{}, {}],
            optionalArrayOfObjects: undefined,

            // any
            requiredAny: {},
            optionalAny: undefined,
            requiredArrayOfAny: [{}, 42, 'string'], // [{}, 42, 'string', null, undefined],
            optionalArrayOfAny: undefined,

            // weakly typed arrays
            requiredArray: [],
            optionalArray: undefined,

            // decimals
            requiredDecimal: 42.1,
            optionalDecimal: undefined,
            requiredArrayOfDecimals: [42.1, 42.24],
            optionalArrayOfDecimals: undefined,

            // decimal places (up to 15 decimal places)
            requiredDecimalTo1Place: 42.1,
            optionalDecimalTo1Place: undefined,
            requiredDecimalTo15Places: 42.123456789012345, // eslint-disable-line no-loss-of-precision
            optionalDecimalTo15Places: undefined,

            requiredPrimitive: 'primitive',
            optionalPrimitive: undefined,
            requiredArrayOfPrimitives: ['string', 42, 41n, true, null, undefined, Symbol('string')],
            optionalArrayOfPrimitives: undefined,

            // inline custom validators
            productType: 'book',
            someProperty: 'Swamplandia',
          })
        },
        'the documentation should be valid': (expect) => (err, actual) => {
          expect(err).to.equal(null)
          expect(actual.err).to.equal(null)
        }, // /then
      }, // /when optionalsNotSet
    }, // /## Types / Validators
    '// ### Schema Inheritance': () => {
      const { blueprint, registerBlueprint } = require('@polyn/blueprint')

      const productBp = blueprint('Product', {
        id: 'string',
        title: 'string',
        description: 'string',
        price: 'decimal:2',
        type: /^book|magazine|card$/,
        metadata: {
          keywords: 'string[]',
        },
      })

      registerBlueprint('Author', {
        firstName: 'string',
        lastName: 'string',
      })

      const bookBp = blueprint('Book', {
        ...productBp.schema,
        ...{
          metadata: {
            ...productBp.schema.metadata,
            ...{
              isbn: 'string',
              authors: 'Author[]',
            },
          },
        },
      })

      console.dir(productBp.validate({
        id: '5623c1263b952eb796d79e02',
        title: 'Happy Birthday',
        description: 'A birthday card',
        price: 9.99,
        type: 'card',
        metadata: {
          keywords: ['bday'],
        },
      }), { depth: null })

      console.dir(bookBp.validate({
        id: '5623c1263b952eb796d79e03',
        title: 'Swamplandia',
        description: 'From the celebrated...',
        price: 9.99,
        type: 'book',
        metadata: {
          keywords: ['swamp'],
          isbn: '0-307-26399-1',
          authors: [{
            firstName: 'Karen',
            lastName: 'Russell',
          }],
        },
      }), { depth: null })
    }, // /### Schema Inheritance
  }) // /test
} // /module

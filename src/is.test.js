module.exports = (test, dependencies) => {
  const { expect } = dependencies
  const { is } = dependencies.sut

  const makeDescription = (func, name, value) => {
    try {
      return `${func}.${name}(${value})`
    } catch (e) {
      // ignore - symbols can't be coerced to strings
      return `${func}.${name}(probably a symbol)`
    }
  }

  const assert = (name, values) => {
    values.is.forEach((value) => {
      expect(is[name](value), makeDescription('is', name, value)).to.equal(true)
      expect(is.not[name](value), makeDescription('is.not', name, value)).to.equal(false)
    })

    values.isNot.forEach((value) => {
      expect(is[name](value), makeDescription('is', name, value)).to.equal(false)
      expect(is.not[name](value), makeDescription('is.not', name, value)).to.equal(true)
    })
  }

  return test('given `is`', {
    'when `getType` is executed with a value, it should return a string the describes the type of object value represents': (expect) => {
      // the keys below are the lowered form of printed type:
      // [object Boolean], [object Number], etc.
      const assertions = {
        boolean: [true, false],
        number: [-1, 0, 1],
        string: ['hello', "hello", `hello`], // eslint-disable-line quotes
        function: [() => {}, function () {}, class Foo {}],
        asyncfunction: [async () => {}],
        promise: [new Promise(() => {})],
        array: [[1, 2], new Array()], // eslint-disable-line no-array-constructor
        date: [new Date()],
        regexp: [/[A-Z]/, new RegExp('[A-Z]')],
        object: [{}, { foo: 'bar' }, Object.prototype]
      }

      Object.keys(assertions).forEach((key) => {
        assertions[key].forEach((value) => {
          expect(is.getType(value)).to.equal(key)
        })
      })
    },
    // defined
    'when `defined` is executed': {
      'it should return the expected responses': () => {
        assert('defined', {
          is: [
            null,
            '',
            ' ',
            '   ',
            42,
            true,
            false,
            [null],
            {},
            ' function '
          ],
          isNot: [
            undefined
          ]
        })
      }
    },
    // nullOrUndefined
    'when `nullOrUndefined` is executed': {
      'it should return the expected responses': () => {
        assert('nullOrUndefined', {
          is: [
            null,
            undefined
          ],
          isNot: [
            '',
            ' ',
            '   ',
            42,
            true,
            false,
            [null],
            {},
            ' function '
          ]
        })
      }
    },
    // nullOrWhitespace
    'when `nullOrWhitespace` is executed': {
      'it should return the expected responses': () => {
        assert('nullOrWhitespace', {
          is: [
            null,
            undefined,
            '',
            ' ',
            '   '
          ],
          isNot: [
            42,
            true,
            false,
            [null],
            {},
            ' function '
          ]
        })
      }
    },
    // function
    'when `function` is executed': {
      'it should return the expected responses': () => {
        assert('function', {
          is: [
            () => {},
            function () {},
            class foo {},
            async () => {},
            new Promise(() => {})
          ],
          isNot: [
            42,
            'function',
            null,
            undefined
          ]
        })
      }
    },
    // asyncFunction
    'when `promise` is executed': {
      'it should return the expected responses': () => {
        assert('promise', {
          is: [
            async () => {},
            new Promise(() => {})
          ],
          isNot: [
            42,
            'function',
            null,
            undefined,
            () => {},
            function () {},
            class foo {}
          ]
        })
      }
    },
    // asyncFunction
    'when `asyncFunction` is executed': {
      'it should return the expected responses': () => {
        assert('asyncFunction', {
          is: [
            async () => {},
            new Promise(() => {})
          ],
          isNot: [
            42,
            'function',
            null,
            undefined,
            () => {},
            function () {},
            class foo {}
          ]
        })
      }
    },
    // object
    'when `object` is executed': {
      'it should return the expected responses': () => {
        assert('object', {
          is: [
            {},
            { foo: 'bar' }
          ],
          isNot: [
            42,
            'object',
            null,
            undefined
          ]
        })
      }
    },
    // array
    'when `array` is executed': {
      'it should return the expected responses': () => {
        assert('array', {
          is: [
            [],
            ['string'],
            [1, 2, 3]
          ],
          isNot: [
            42,
            'array',
            null,
            undefined
          ]
        })
      }
    },
    // string
    'when `string` is executed': {
      'it should return the expected responses': () => {
        assert('string', {
          is: [
            'string',
            ' ',
            ''
          ],
          isNot: [
            42,
            ['string'],
            null,
            undefined
          ]
        })
      }
    },
    // boolean
    'when `boolean` is executed': {
      'it should return the expected responses': () => {
        assert('boolean', {
          is: [
            true,
            false
          ],
          isNot: [
            0,
            1,
            'true',
            'false',
            null,
            undefined
          ]
        })
      }
    },
    // date
    'when `date` is executed': {
      'it should return the expected responses': () => {
        assert('date', {
          is: [
            new Date()
          ],
          isNot: [
            Date.now(),
            new Date('adfadf'),
            1556050592207,
            '2019-04-23T20:16:48.112Z',
            null,
            undefined
          ]
        })
      }
    },
    // regexp
    'when `regexp` is executed': {
      'it should return the expected responses': () => {
        assert('regexp', {
          is: [
            /[A-B]/,
            new RegExp('regex')
          ],
          isNot: [
            1,
            'regexp',
            null,
            undefined
          ]
        })
      }
    },
    // number
    'when `number` is executed': {
      'it should return the expected responses': () => {
        assert('number', {
          is: [
            42,
            42.42,
            42.4242424242,
            -42,
            -42.42,
            -42.4242424242,
            Infinity
          ],
          isNot: [
            'one',
            '1',
            [1],
            null,
            undefined
          ]
        })
      }
    },
    // decimal
    'when `decimal` is executed': {
      'it should return the expected responses': () => {
        assert('decimal', {
          is: [
            0,
            42,
            42.4,
            42.42,
            -42,
            -42.4,
            -42.42,
            42.4242424242,
            -42.4242424242,
            Infinity
          ],
          isNot: [
            '42',
            '42.4',
            '42.42',
            '-42',
            '-42.4',
            '-42.42',
            '0',
            '0.0',
            '0.00',
            null,
            undefined
          ]
        })
      }
    },
    'when `decimal` is executed with the places argument, and a valid value is presented': (expect) => {
      expect(is.decimal(0, 0)).to.equal(true)
      expect(is.decimal(42, 0)).to.equal(true)
      expect(is.decimal(42.4, 1)).to.equal(true)
      expect(is.decimal(42.42, 2)).to.equal(true)
      expect(is.decimal(-42, 0)).to.equal(true)
      expect(is.decimal(-42.4, 1)).to.equal(true)
      expect(is.decimal(-42.42, 2)).to.equal(true)
      expect(is.decimal(42.4242424242, 10)).to.equal(true)
      expect(is.decimal(-42.4242424242, 10)).to.equal(true)
    },
    'when `decimal` is executed with the places argument, and an invalid value is presented': (expect) => {
      expect(is.decimal(0, 1)).to.equal(false)
      expect(is.decimal(42, 1)).to.equal(false)
      expect(is.decimal(42.4, 2)).to.equal(false)
      expect(is.decimal(42.42, 3)).to.equal(false)
      expect(is.decimal(-42, 1)).to.equal(false)
      expect(is.decimal(-42.4, 2)).to.equal(false)
      expect(is.decimal(-42.42, 3)).to.equal(false)
      expect(is.decimal(42.4242424242, 12)).to.equal(false)
      expect(is.decimal(-42.4242424242, 12)).to.equal(false)
    },
    'when `not.decimal` is executed with the places argument, and a valid value is presented': (expect) => {
      expect(is.not.decimal(0, 0)).to.equal(false)
      expect(is.not.decimal(42, 0)).to.equal(false)
      expect(is.not.decimal(42.4, 1)).to.equal(false)
      expect(is.not.decimal(42.42, 2)).to.equal(false)
      expect(is.not.decimal(-42, 0)).to.equal(false)
      expect(is.not.decimal(-42.4, 1)).to.equal(false)
      expect(is.not.decimal(-42.42, 2)).to.equal(false)
      expect(is.not.decimal(42.4242424242, 10)).to.equal(false)
      expect(is.not.decimal(-42.4242424242, 10)).to.equal(false)
    },
    'when `not.decimal` is executed with the places argument, and an invalid value is presented': (expect) => {
      expect(is.not.decimal(0, 1)).to.equal(true)
      expect(is.not.decimal(42, 1)).to.equal(true)
      expect(is.not.decimal(42.4, 2)).to.equal(true)
      expect(is.not.decimal(42.42, 3)).to.equal(true)
      expect(is.not.decimal(-42, 1)).to.equal(true)
      expect(is.not.decimal(-42.4, 2)).to.equal(true)
      expect(is.not.decimal(-42.42, 3)).to.equal(true)
      expect(is.not.decimal(42.4242424242, 12)).to.equal(true)
      expect(is.not.decimal(-42.4242424242, 12)).to.equal(true)
    },
    // primitive
    'when `primitive` is executed': {
      'it should return the expected responses': () => {
        assert('primitive', {
          is: [
            true,
            false,
            'string',
            null,
            undefined,
            0,
            1,
            42.4,
            Infinity,
            1n,
            BigInt(Number.MAX_SAFE_INTEGER + Number.MAX_SAFE_INTEGER), // eslint-disable-line no-undef
            Symbol(true),
            Symbol(false),
            Symbol('string'),
            Symbol(null),
            Symbol(undefined),
            Symbol(0),
            Symbol(1),
            Symbol(42.4),
            Symbol(1n)
          ],
          isNot: [
            {},
            { foo: 'bar' },
            function () {},
            () => {},
            new Date()
          ]
        })
      }
    }
  })
}

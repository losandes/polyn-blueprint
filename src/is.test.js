const { expect } = require('chai')
const test = require('supposed').Suite({ assertionLibrary: expect })
const is = require('./is.js')

const assert = (name, values) => {
  values.is.forEach((value) => {
    expect(is[name](value), `is.${name}(${value})`).to.equal(true)
    expect(is.not[name](value), `is.not.${name}(${value})`).to.equal(false)
  })

  values.isNot.forEach((value) => {
    expect(is[name](value), `is.${name}(${value})`).to.equal(false)
    expect(is.not[name](value), `is.not.${name}(${value})`).to.equal(true)
  })
}

test('given `is`', {
  'when `getType` is executed with a value, it should return a string the describes the type of object value represents': (expect) => {
    expect(is.getType(42)).to.equal('number')
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
          class foo {}
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
  }
})

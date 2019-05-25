module.exports = (test) => {
  const { blueprint } = test.sut
  const makeExpectedArrayErrorMessage = (bpName, propNames, expectedType, actualType, index) => {
    let subMessages = propNames.map((propName) => {
      return `expected \`${propName}[${index}]\` {${actualType}} to be {${expectedType}}`
    })

    return `Invalid ${bpName}: ${subMessages.join(', ')}`
  }

  return test('given `blueprint (common-types)`', {
    'it should support `function`, and `function?`': (expect) => {
      const expected = {
        requiredFunction: () => {},
        requiredPromise: new Promise(() => {}),
        requiredAsync: async () => {},
        optionalFunction: function () {}
      }
      const actual = blueprint('sut', {
        requiredFunction: 'function',
        requiredPromise: 'function',
        requiredAsync: 'function',
        optionalFunction: 'function?'
      }).validate(expected)

      expect(actual.err).to.be.null
      expect(actual.value).to.deep.equal(expected)
    },
    'it should support `promise`, and `promise?`': (expect) => {
      const expected = {
        requiredPromise: new Promise(() => {}),
        optionalPromise: new Promise(() => {}),
        requiredAsync: async () => {}
      }
      const actual = blueprint('sut', {
        requiredPromise: 'promise',
        optionalPromise: 'promise?',
        requiredAsync: 'promise'
      }).validate(expected)

      expect(actual.err).to.be.null
      expect(actual.value).to.deep.equal(expected)
    },
    'it should support `asyncFunction`, and `asyncFunction?`': (expect) => {
      const expected = {
        requiredAsync: async () => {},
        optionalAsync: async () => {},
        requiredPromise: async () => {}
      }
      const actual = blueprint('sut', {
        requiredAsync: 'asyncFunction',
        optionalAsync: 'asyncFunction?',
        requiredPromise: 'asyncFunction'
      }).validate(expected)

      expect(actual.err).to.be.null
      expect(actual.value).to.deep.equal(expected)
    },
    'it should support `object`, and `object?`': (expect) => {
      const expected = {
        requiredObject: {},
        optionalObject: { foo: 'bar' }
      }
      const actual = blueprint('sut', {
        requiredObject: 'object',
        optionalObject: 'object?'
      }).validate(expected)

      expect(actual.err).to.be.null
      expect(actual.value).to.deep.equal(expected)
    },
    'it should support `string`, and `string?`': (expect) => {
      const expected = {
        requiredString: 'hello',
        optionalString: 'world'
      }
      const actual = blueprint('sut', {
        requiredString: 'string',
        optionalString: 'string?'
      }).validate({
        requiredString: 'hello',
        optionalString: 'world'
      })

      expect(actual.err).to.be.null
      expect(actual.value).to.deep.equal(expected)
    },
    'it should not pass for empty strings with `string`, and `string?`': (expect) => {
      const actual = blueprint('sut', {
        requiredString: 'string',
        optionalString: 'string?',
        emptyString: 'string',
        optionalEmptyString: 'string?'
      }).validate({
        requiredString: 'hello',
        optionalString: 'world',
        emptyString: '',
        optionalEmptyString: ''
      })

      expect(actual.err).to.not.be.null
      expect(actual.err.message).to.equal('Invalid sut: expected `emptyString` {string} to not be an empty string, expected `optionalEmptyString` {string} to not be an empty string')
    },
    'it should trim strings, when they exist': (expect) => {
      const expected = {
        requiredString: 'hello',
        optionalString: 'world'
      }
      const actual = blueprint('sut', {
        requiredString: 'string',
        optionalString: 'string?'
      }).validate({
        requiredString: ' hello  ',
        optionalString: '  world '
      })

      expect(actual.err).to.be.null
      expect(actual.value).to.deep.equal(expected)
    },
    'it should support `boolean`, and `boolean?`': (expect) => {
      const expected = {
        requiredBoolean: true,
        optionalBoolean: false
      }
      const actual = blueprint('sut', {
        requiredBoolean: 'boolean',
        optionalBoolean: 'boolean?'
      }).validate(expected)

      expect(actual.err).to.be.null
      expect(actual.value).to.deep.equal(expected)
    },
    'it should support `date`, and `date?`': (expect) => {
      const expected = {
        requiredDate: new Date(),
        optionalDate: new Date()
      }
      const actual = blueprint('sut', {
        requiredDate: 'date',
        optionalDate: 'date?'
      }).validate(expected)

      expect(actual.err).to.be.null
      expect(actual.value).to.deep.equal(expected)
    },
    'it should support `number`, and `number?`': (expect) => {
      const expected = {
        requiredNumber: 123,
        optionalNumber: 123
      }
      const actual = blueprint('sut', {
        requiredNumber: 'number',
        optionalNumber: 'number?'
      }).validate(expected)

      expect(actual.err).to.be.null
      expect(actual.value).to.deep.equal(expected)
    },
    'it should support `decimal`, `decimal?`, and decimal places to 15 places': (expect) => {
      const expected = {
        requiredDecimal: 10.01,
        optionalDecimal: 42.1
      }
      const actual = blueprint('sut', {
        requiredDecimal: 'decimal',
        optionalDecimal: 'decimal?'
      }).validate(expected)

      expect(actual.err).to.be.null
      expect(actual.value).to.deep.equal(expected)
    },
    'it should support `regexp`, and `regexp?`': (expect) => {
      const expected = {
        requiredRegexp: /^book$/ig,
        optionalRegexp: new RegExp('book')
      }
      const actual = blueprint('sut', {
        requiredRegexp: 'regexp',
        optionalRegexp: 'regexp?'
      }).validate(expected)

      expect(actual.err).to.be.null
      expect(actual.value).to.deep.equal(expected)
    },
    'it should support `any`, and `any?`': (expect) => {
      const expected = {
        required: 'fourty-two',
        optional: 42
      }
      const actual = blueprint('sut', {
        required: 'any',
        optional: 'any?'
      }).validate(expected)

      expect(actual.err).to.be.null
      expect(actual.value).to.deep.equal(expected)
    },
    'it should support `array`, and `array?`': (expect) => {
      const expected = {
        requiredArray: [1, 2, 3],
        optionalArray: null
      }
      const actual = blueprint('sut', {
        requiredArray: 'array',
        optionalArray: 'array?'
      }).validate(expected)

      expect(actual.err).to.be.null
      expect(actual.value).to.deep.equal(expected)
    },
    'it should support `function[]`, and `function[]?`': (expect) => {
      const expected = {
        required: [() => {}, () => {}],
        optional: null
      }
      const bp = blueprint('sut', {
        required: 'function[]',
        optional: 'function[]?'
      })
      const actual = bp.validate(expected)
      const actualInvalid = bp.validate({
        required: [() => {}, 'foo'],
        optional: [() => {}, 'foo']
      })

      expect(actual.err).to.be.null
      expect(actual.value).to.deep.equal(expected)
      expect(actualInvalid.err).to.not.be.null
      expect(actualInvalid.err.message).to.equal(
        makeExpectedArrayErrorMessage('sut', ['required', 'optional'], 'function', 'string', 1))
      expect(actualInvalid.value).to.be.null
    },
    // ARRAYS ==================================================================
    'it should support `object[]`, and `object[]?`': (expect) => {
      const expected = {
        required: [{}, {}],
        optional: null
      }
      const bp = blueprint('sut', {
        required: 'object[]',
        optional: 'object[]?'
      })
      const actual = bp.validate(expected)
      const actualInvalid = bp.validate({
        required: [{}, 'foo'],
        optional: [{}, 'foo']
      })

      expect(actual.err).to.be.null
      expect(actual.value).to.deep.equal(expected)
      expect(actualInvalid.err).to.not.be.null
      expect(actualInvalid.err.message).to.equal(
        makeExpectedArrayErrorMessage('sut', ['required', 'optional'], 'object', 'string', 1))
      expect(actualInvalid.value).to.be.null
    },
    'it should support `string[]`, and `string[]?`': (expect) => {
      const expected = {
        required: ['string', 'string'],
        optional: null
      }
      const bp = blueprint('sut', {
        required: 'string[]',
        optional: 'string[]?'
      })
      const actual = bp.validate(expected)
      const actualInvalid = bp.validate({
        required: [{}, 'foo'],
        optional: [{}, 'foo']
      })

      expect(actual.err).to.be.null
      expect(actual.value).to.deep.equal(expected)
      expect(actualInvalid.err).to.not.be.null
      expect(actualInvalid.err.message).to.equal(
        makeExpectedArrayErrorMessage('sut', ['required', 'optional'], 'string', 'object', 0))
      expect(actualInvalid.value).to.be.null
    },
    'it should support `boolean[]`, and `boolean[]?`': (expect) => {
      const expected = {
        required: [true, false],
        optional: null
      }
      const bp = blueprint('sut', {
        required: 'boolean[]',
        optional: 'boolean[]?'
      })
      const actual = bp.validate(expected)
      const actualInvalid = bp.validate({
        required: [true, 'false'],
        optional: [true, 'false']
      })

      expect(actual.err).to.be.null
      expect(actual.value).to.deep.equal(expected)
      expect(actualInvalid.err).to.not.be.null
      expect(actualInvalid.err.message).to.equal(
        makeExpectedArrayErrorMessage('sut', ['required', 'optional'], 'boolean', 'string', 1))
      expect(actualInvalid.value).to.be.null
    },
    'it should support `date[]`, and `date[]?`': (expect) => {
      const expected = {
        required: [new Date()],
        optional: null
      }
      const bp = blueprint('sut', {
        required: 'date[]',
        optional: 'date[]?'
      })
      const actual = bp.validate(expected)
      const actualInvalid = bp.validate({
        required: [new Date(), 'false'],
        optional: [new Date(), 'false']
      })

      expect(actual.err).to.be.null
      expect(actual.value).to.deep.equal(expected)
      expect(actualInvalid.err).to.not.be.null
      expect(actualInvalid.err.message).to.equal(
        makeExpectedArrayErrorMessage('sut', ['required', 'optional'], 'date', 'string', 1))
      expect(actualInvalid.value).to.be.null
    },
    'it should support `number[]`, and `number[]?`': (expect) => {
      const expected = {
        required: [0, 1],
        optional: null
      }
      const bp = blueprint('sut', {
        required: 'number[]',
        optional: 'number[]?'
      })
      const actual = bp.validate(expected)
      const actualInvalid = bp.validate({
        required: [1, 'false'],
        optional: [1, 'false']
      })

      expect(actual.err).to.be.null
      expect(actual.value).to.deep.equal(expected)
      expect(actualInvalid.err).to.not.be.null
      expect(actualInvalid.err.message).to.equal(
        makeExpectedArrayErrorMessage('sut', ['required', 'optional'], 'number', 'string', 1))
      expect(actualInvalid.value).to.be.null
    },
    'it should support `decimal[]`, and `decimal[]?`': (expect) => {
      const expected = {
        required: [10.01, 10.02],
        optional: null
      }
      const bp = blueprint('sut', {
        required: 'decimal[]',
        optional: 'decimal[]?'
      })
      const actual = bp.validate(expected)
      const actualInvalid = bp.validate({
        required: [10.01, '10'],
        optional: [10.01, '10']
      })

      expect(actual.err).to.be.null
      expect(actual.value).to.deep.equal(expected)
      expect(actualInvalid.err).to.not.be.null
      expect(actualInvalid.err.message).to.equal(
        makeExpectedArrayErrorMessage('sut', ['required', 'optional'], 'decimal', 'string', 1))
      expect(actualInvalid.value).to.be.null
    },
    'it should support `regexp[]`, and `regexp[]?`': (expect) => {
      const expected = {
        required: [/^book$/ig, /^person$/ig],
        optional: null
      }
      const bp = blueprint('sut', {
        required: 'regexp[]',
        optional: 'regexp[]?'
      })
      const actual = bp.validate(expected)
      const actualInvalid = bp.validate({
        required: [/^book/i, 'book'],
        optional: [/^book/i, 'book']
      })

      expect(actual.err).to.be.null
      expect(actual.value).to.deep.equal(expected)
      expect(actualInvalid.err).to.not.be.null
      expect(actualInvalid.err.message).to.equal(
        makeExpectedArrayErrorMessage('sut', ['required', 'optional'], 'regexp', 'string', 1))
      expect(actualInvalid.value).to.be.null
    },
    'it should support `any[]`, and `any[]?`': (expect) => {
      const expected = {
        required: ['string', 42],
        optional: null
      }
      const bp = blueprint('sut', {
        required: 'any[]',
        optional: 'any[]?'
      })
      const actual = bp.validate(expected)
      const actualInvalid = bp.validate({
        required: null,
        optional: 'string'
      })

      expect(actual.err).to.be.null
      expect(actual.value).to.deep.equal(expected)
      expect(actualInvalid.err).to.not.be.null
      expect(actualInvalid.err.message).to.equal('Invalid sut: expected `required` {null} to be {any[]}, expected `optional` {string} to be {any[]}')
      expect(actualInvalid.value).to.be.null
    }
  })
}

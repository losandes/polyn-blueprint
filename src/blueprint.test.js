const { expect } = require('chai')
const test = require('supposed').Suite({ assertionLibrary: expect })
const { blueprint, registerValidator, registerBlueprint } = require('./blueprint.js')

test('given `blueprint`', {
  'when a blueprint is constructed with a name, and a blueprint, it should return a `validate` function': (expect) => {
    const actual = blueprint('sut', {
      requiredString: 'string',
      optionalString: 'string?'
    })

    expect(actual.err).to.be.null
    expect(typeof actual.validate).to.equal('function')
  },
  'when a blueprint is constructed with an invalid name, it should return an err': (expect) => {
    const actual = blueprint({
      requiredString: 'string',
      optionalString: 'string?'
    })

    expect(actual.err).to.not.be.null
    expect(actual.err.message).to.equal('blueprint requires a name {string}, and a blueprint {object}')
  },
  'when a blueprint is constructed with an invalid blueprint, it should return an err': (expect) => {
    const actual = blueprint('sut')

    expect(actual.err).to.not.be.null
    expect(actual.err.message).to.equal('blueprint requires a name {string}, and a blueprint {object}')
  },
  'when a blueprint is validated with a valid implementation': {
    when: () => {
      return blueprint('sut', {
        requiredString: 'string',
        optionalString: 'string?'
      }).validate({
        requiredString: 'hello',
        optionalString: 'world'
      })
    },
    'it should NOT return an `err`': (expect) => (err, actual) => {
      expect(err).to.be.null
      expect(actual.err).to.be.null
    },
    'it should return a `value`': (expect) => (err, actual) => {
      expect(err).to.be.null
      expect(actual.value).to.deep.equal({
        requiredString: 'hello',
        optionalString: 'world'
      })
    }
  },
  'when a blueprint is validated with an invalid implementation': {
    when: () => {
      return blueprint('sut', {
        requiredString: 'string',
        optionalString: 'string?'
      }).validate({
        requiredString: null,
        optionalString: 42
      })
    },
    'it should return an `err`': (expect) => (err, actual) => {
      expect(err).to.be.null
      expect(actual.err).to.not.be.null
      expect(actual.err.message).to.equal('Invalid sut: sut.requiredString {string} is required, sut.optionalString must be a string if present')
    },
    'it should NOT return a `value`': (expect) => (err, actual) => {
      expect(err).to.be.null
      expect(actual.value).to.be.null
    }
  },
  'when a blueprint has nested blueprints, and is validated with a valid nest implementation': {
    when: () => {
      return blueprint('sut', {
        requiredString: 'string',
        optionalString: 'string?',
        grandParent: {
          requiredString: 'string',
          optionalString: 'string?',
          parent: {
            requiredString: 'string',
            optionalString: 'string?',
            child: {
              requiredString: 'string',
              optionalString: 'string?'
            }
          }
        }
      }).validate({
        requiredString: 'hello',
        optionalString: 'world',
        grandParent: {
          requiredString: 'hello',
          optionalString: 'world',
          parent: {
            requiredString: 'hello',
            optionalString: 'world',
            child: {
              requiredString: 'hello',
              optionalString: 'world'
            }
          }
        }
      })
    },
    'it should NOT return an `err`': (expect) => (err, actual) => {
      expect(err).to.be.null
      expect(actual.err).to.be.null
    },
    'it should return a `value`': (expect) => (err, actual) => {
      expect(err).to.be.null
      expect(actual.value).to.deep.equal({
        requiredString: 'hello',
        optionalString: 'world',
        grandParent: {
          requiredString: 'hello',
          optionalString: 'world',
          parent: {
            requiredString: 'hello',
            optionalString: 'world',
            child: {
              requiredString: 'hello',
              optionalString: 'world'
            }
          }
        }
      })
    }
  },
  'when a blueprint has nested blueprints, and is validated with an invalid nest implementation': {
    when: () => {
      return blueprint('sut', {
        requiredString: 'string',
        optionalString: 'string?',
        grandParent: {
          requiredString: 'string',
          optionalString: 'string?',
          parent: {
            requiredString: 'string',
            optionalString: 'string?',
            child: {
              requiredString: 'string',
              optionalString: 'string?'
            }
          }
        }
      }).validate({
        requiredString: 'hello',
        optionalString: 'world',
        grandParent: {
          requiredString: 'hello',
          optionalString: 'world',
          parent: {
            requiredString: 'hello',
            optionalString: 'world',
            child: {
              requiredString: null,
              optionalString: 42
            }
          }
        }
      })
    },
    'it should return an `err`': (expect) => (err, actual) => {
      expect(err).to.be.null
      expect(actual.err).to.not.be.null
      expect(actual.err.message).to.equal('Invalid sut: sut.grandParent.parent.child.requiredString {string} is required, sut.grandParent.parent.child.optionalString must be a string if present')
    },
    'it should NOT return a `value`': (expect) => (err, actual) => {
      expect(err).to.be.null
      expect(actual.value).to.be.null
    }
  },
  'when a blueprint has nested blueprints, validators should receive the parent input as an argument': (expect) => {
    let validatorInput
    const expected = {
      requiredString: 'hello',
      grandParent: {
        requiredString: 'hello',
        parent: {
          requiredString: 'hello',
          child: {
            custom: 'test'
          }
        }
      }
    }
    const actual = blueprint('sut', {
      requiredString: 'string',
      grandParent: {
        requiredString: 'string',
        parent: {
          requiredString: 'string',
          child: {
            custom: (input) => {
              validatorInput = input
            }
          }
        }
      }
    }).validate(expected)

    expect(actual.err).to.be.null
    expect(validatorInput.key).to.equal('sut.grandParent.parent.child.custom')
    expect(validatorInput.value).to.equal(expected.grandParent.parent.child.custom)
    expect(validatorInput.input).to.deep.equal(expected.grandParent.parent.child)
    expect(validatorInput.root).to.deep.equal(expected)
  },
  'when an implementation has properties that aren\'t on the blueprint': {
    when: () => {
      return blueprint('sut', {
        requiredString: 'string',
        optionalString: 'string?'
      }).validate({
        requiredString: 'hello',
        optionalString: 'world',
        unexpected: 42
      })
    },
    'it should NOT validate them': (expect) => (err, actual) => {
      expect(err).to.be.null
      expect(actual.err).to.be.null
    },
    'it should NOT add them to the value output': (expect) => (err, actual) => {
      expect(err).to.be.null
      expect(actual.value).to.deep.equal({
        requiredString: 'hello',
        optionalString: 'world'
      })
    }
  },
  'it should support `function`, and `function?`': (expect) => {
    const expected = {
      requiredFunction: () => {},
      optionalFunction: function () {}
    }
    const actual = blueprint('sut', {
      requiredFunction: 'function',
      optionalFunction: 'function?'
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
    }).validate(expected)

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
    const bp = {
      requiredDecimal: 'decimal',
      optionalDecimal: 'decimal?'
    }

    for (let i = 1; i <= 15; i += 1) {
      expected[`decimal${i}`] = parseFloat(42.111111111111111.toFixed(i))
      expected[`optionalDecimal${i}`] = null
      bp[`decimal${i}`] = `decimal:${i}`
      bp[`optionalDecimal${i}`] = `decimal:${i}?`
    }

    const actual = blueprint('sut', bp).validate(expected)

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
  'it should support regular expressions': (expect) => {
    const expected = {
      type: 'book'
    }
    const actual = blueprint('sut', {
      type: /^book$/i
    }).validate(expected)
    const actualInvalid = blueprint('sut', {
      type: /^book$/i
    }).validate({
      type: 'person'
    })

    expect(actual.err).to.be.null
    expect(actual.value).to.deep.equal(expected)
    expect(actualInvalid.err).to.not.be.null
    expect(actualInvalid.err.message).to.equal('Invalid sut: sut.type does not match /^book$/i')
  },
  'it should support custom validators (functions)': (expect) => {
    const validator = ({ key, value }) => {
      if (value === 123) {
        return {
          err: null,
          value
        }
      }
      return {
        err: new Error(`bad ${key}`)
      }
    }
    const expected = {
      required123: 123,
      required1232: 123
    }
    const bp = blueprint('sut', {
      required123: validator,
      required1232: validator
    })

    const actual = bp.validate(expected)
    const actualInvalid = bp.validate({
      required123: 123,
      required1232: 456
    })

    expect(actual.err).to.be.null
    expect(actual.value).to.deep.equal(expected)
    expect(actualInvalid.err).to.not.be.null
    expect(actualInvalid.err.message).to.equal('Invalid sut: bad sut.required1232')
    expect(actualInvalid.value).to.be.null
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
  'it should support `array<function>`, and `array<function>?`': (expect) => {
    const expected = {
      required: [() => {}, () => {}],
      optional: null
    }
    const bp = blueprint('sut', {
      required: 'array<function>',
      optional: 'array<function>?'
    })
    const actual = bp.validate(expected)
    const actualInvalid = bp.validate({
      required: [() => {}, 'foo'],
      optional: [() => {}, 'foo']
    })

    expect(actual.err).to.be.null
    expect(actual.value).to.deep.equal(expected)
    expect(actualInvalid.err).to.not.be.null
    expect(actualInvalid.err.message).to.equal('Invalid sut: All values for sut.required must be of type, \'function\', All values for sut.optional must be of type, \'function\'')
    expect(actualInvalid.value).to.be.null
  },
  'it should support `array<object>`, and `array<object>?`': (expect) => {
    const expected = {
      required: [{}, {}],
      optional: null
    }
    const bp = blueprint('sut', {
      required: 'array<object>',
      optional: 'array<object>?'
    })
    const actual = bp.validate(expected)
    const actualInvalid = bp.validate({
      required: [{}, 'foo'],
      optional: [{}, 'foo']
    })

    expect(actual.err).to.be.null
    expect(actual.value).to.deep.equal(expected)
    expect(actualInvalid.err).to.not.be.null
    expect(actualInvalid.err.message).to.equal('Invalid sut: All values for sut.required must be of type, \'object\', All values for sut.optional must be of type, \'object\'')
    expect(actualInvalid.value).to.be.null
  },
  'it should support `array<string>`, and `array<string>?`': (expect) => {
    const expected = {
      required: ['string', 'string'],
      optional: null
    }
    const bp = blueprint('sut', {
      required: 'array<string>',
      optional: 'array<string>?'
    })
    const actual = bp.validate(expected)
    const actualInvalid = bp.validate({
      required: [{}, 'foo'],
      optional: [{}, 'foo']
    })

    expect(actual.err).to.be.null
    expect(actual.value).to.deep.equal(expected)
    expect(actualInvalid.err).to.not.be.null
    expect(actualInvalid.err.message).to.equal('Invalid sut: All values for sut.required must be of type, \'string\', All values for sut.optional must be of type, \'string\'')
    expect(actualInvalid.value).to.be.null
  },
  'it should support `array<boolean>`, and `array<boolean>?`': (expect) => {
    const expected = {
      required: [true, false],
      optional: null
    }
    const bp = blueprint('sut', {
      required: 'array<boolean>',
      optional: 'array<boolean>?'
    })
    const actual = bp.validate(expected)
    const actualInvalid = bp.validate({
      required: [true, 'false'],
      optional: [true, 'false']
    })

    expect(actual.err).to.be.null
    expect(actual.value).to.deep.equal(expected)
    expect(actualInvalid.err).to.not.be.null
    expect(actualInvalid.err.message).to.equal('Invalid sut: All values for sut.required must be of type, \'boolean\', All values for sut.optional must be of type, \'boolean\'')
    expect(actualInvalid.value).to.be.null
  },
  'it should support `array<date>`, and `array<date>?`': (expect) => {
    const expected = {
      required: [new Date()],
      optional: null
    }
    const bp = blueprint('sut', {
      required: 'array<date>',
      optional: 'array<date>?'
    })
    const actual = bp.validate(expected)
    const actualInvalid = bp.validate({
      required: [new Date(), 'false'],
      optional: [new Date(), 'false']
    })

    expect(actual.err).to.be.null
    expect(actual.value).to.deep.equal(expected)
    expect(actualInvalid.err).to.not.be.null
    expect(actualInvalid.err.message).to.equal('Invalid sut: All values for sut.required must be of type, \'date\', All values for sut.optional must be of type, \'date\'')
    expect(actualInvalid.value).to.be.null
  },
  'it should support `array<number>`, and `array<number>?`': (expect) => {
    const expected = {
      required: [0, 1],
      optional: null
    }
    const bp = blueprint('sut', {
      required: 'array<number>',
      optional: 'array<number>?'
    })
    const actual = bp.validate(expected)
    const actualInvalid = bp.validate({
      required: [1, 'false'],
      optional: [1, 'false']
    })

    expect(actual.err).to.be.null
    expect(actual.value).to.deep.equal(expected)
    expect(actualInvalid.err).to.not.be.null
    expect(actualInvalid.err.message).to.equal('Invalid sut: All values for sut.required must be of type, \'number\', All values for sut.optional must be of type, \'number\'')
    expect(actualInvalid.value).to.be.null
  },
  'it should support `array<decimal>`, `decimal?`, and decimal places to 20 places': (expect) => {
    const expected = {
      required: [10.01, 10.02],
      optional: null
    }
    const bp = blueprint('sut', {
      required: 'array<decimal>',
      optional: 'array<decimal>?'
    })
    const actual = bp.validate(expected)
    const actualInvalid = bp.validate({
      required: [10.01, '10'],
      optional: [10.01, '10']
    })

    expect(actual.err).to.be.null
    expect(actual.value).to.deep.equal(expected)
    expect(actualInvalid.err).to.not.be.null
    expect(actualInvalid.err.message).to.equal('Invalid sut: All values for sut.required must be of type, \'decimal\', All values for sut.optional must be of type, \'decimal\'')
    expect(actualInvalid.value).to.be.null
  },
  'it should support `array<regexp>`, and `array<regexp>?`': (expect) => {
    const expected = {
      required: [/^book$/ig, /^person$/ig],
      optional: null
    }
    const bp = blueprint('sut', {
      required: 'array<regexp>',
      optional: 'array<regexp>?'
    })
    const actual = bp.validate(expected)
    const actualInvalid = bp.validate({
      required: [/^book/i, 'book'],
      optional: [/^book/i, 'book']
    })

    expect(actual.err).to.be.null
    expect(actual.value).to.deep.equal(expected)
    expect(actualInvalid.err).to.not.be.null
    expect(actualInvalid.err.message).to.equal('Invalid sut: All values for sut.required must be of type, \'regexp\', All values for sut.optional must be of type, \'regexp\'')
    expect(actualInvalid.value).to.be.null
  },
  'it should support adding new validators with `registerValidator`': (expect) => {
    const userBp = blueprint('user', {
      firstName: 'string',
      lastName: 'string'
    })
    registerValidator('user', ({ key, value }) => {
      const validation = userBp.validate(value)

      if (validation.err) {
        return {
          err: validation.err
        }
      }

      return {
        err: null,
        value
      }
    })
    const expected = {
      user: {
        firstName: 'John',
        lastName: 'Doe'
      }
    }
    const bp = blueprint('sut', {
      user: 'user'
    })
    const actual = bp.validate(expected)
    const actualInvalid = bp.validate({
      firstName: 'missing user object'
    })

    expect(actual.err).to.be.null
    expect(actual.value).to.deep.equal(expected)
    expect(actualInvalid.err).to.not.be.null
    expect(actualInvalid.err.message).to.equal('Invalid sut: Invalid user: user.firstName {string} is required, user.lastName {string} is required')
    expect(actualInvalid.value).to.be.null
  },
  'it should pass `key`, `value`, `input`, and `root` to registered validators': (expect) => {
    let actual
    registerValidator('registerValidatorArgs', ({ key, value, input, root }) => {
      actual = { key, value, input, root }
      return { err: null }
    })

    blueprint('sut', {
      args: 'registerValidatorArgs'
    }).validate({
      args: 'args-value',
      other: 'other-value'
    })

    expect(actual).to.deep.equal({
      key: 'sut.args',
      value: 'args-value',
      input: { args: 'args-value', other: 'other-value' },
      root: { args: 'args-value', other: 'other-value' }
    })
  },
  'it should NOT throw if a validator doesn\'t return anything': (expect) => {
    registerValidator('registerValidatorWithNoReturn', () => {})
    const actual = blueprint('sut', {
      something: 'registerValidatorWithNoReturn'
    }).validate({
      something: 'value'
    })

    expect(actual.err).to.be.null
  },
  'it should support adding blueprints as new validators with `registerBlueprint`': (expect) => {
    registerBlueprint('registerBlueprint:user', {
      firstName: 'string',
      lastName: 'string'
    })
    const expected = {
      user: {
        firstName: 'John',
        lastName: 'Doe'
      }
    }
    const bp = blueprint('sut', {
      user: 'registerBlueprint:user'
    })
    const actual = bp.validate(expected)
    const actualInvalid = bp.validate({
      firstName: 'missing user object'
    })

    expect(actual.err).to.be.null
    expect(actual.value).to.deep.equal(expected)
    expect(actualInvalid.err).to.not.be.null
    expect(actualInvalid.err.message).to.equal('Invalid sut: Invalid registerBlueprint:user: registerBlueprint:user.firstName {string} is required, registerBlueprint:user.lastName {string} is required')
    expect(actualInvalid.value).to.be.null
  },
  '`registerBlueprint` should support null values': (expect) => {
    registerBlueprint('registerBlueprint:null:user', {
      firstName: 'string',
      lastName: 'string'
    })
    const actual = blueprint('sut', {
      user: 'registerBlueprint:null:user?'
    }).validate({
      user: null
    })

    expect(actual.err).to.be.null
  },
  '`registerBlueprint` should support arrays': (expect) => {
    registerBlueprint('registerBlueprint:array:user', {
      firstName: 'string',
      lastName: 'string'
    })
    const bp = blueprint('sut', {
      users: 'array<registerBlueprint:array:user>'
    })

    const expected = {
      users: [{
        firstName: 'John',
        lastName: 'Doe'
      }, {
        firstName: 'John',
        lastName: 'Doe'
      }]
    }
    const actual = bp.validate(expected)
    const actualInvalid = bp.validate({
      users: [{
        firstName: 'John',
        lastName: 'Doe'
      }, {
        firstName: 'John'
      }]
    })

    expect(actual.err).to.be.null
    expect(actual.value).to.deep.equal(expected)
    expect(actualInvalid.err).to.not.be.null
    expect(actualInvalid.err.message).to.equal('Invalid sut: All values for array<registerBlueprint:array:user> must be of type, \'registerBlueprint:array:user\'')
    expect(actualInvalid.value).to.be.null
  },
  '`registerBlueprint` should support nullable arrays': (expect) => {
    registerBlueprint('registerBlueprint:null:array:user', {
      firstName: 'string',
      lastName: 'string'
    })
    const actual = blueprint('sut', {
      users: 'array<registerBlueprint:null:array:user>?'
    }).validate({
      users: null
    })

    expect(actual.err).to.be.null
  },
  'it should not throw when a null object is validated': (expect) => {
    const actual = blueprint('sut', { string: 'string' })
      .validate()

    expect(actual.err).to.not.be.null
    expect(actual.err.message).to.equal('Invalid sut: sut.string {string} is required')
  }
})

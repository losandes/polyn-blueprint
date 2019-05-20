module.exports = (test) => {
  const {
    blueprint,
    registerExpression,
    registerValidator,
    registerBlueprint,
    registerType,
    optional,
    gt
  } = test.sut

  const makeErrorMessage = (options) => {
    return `expected \`${options.key}\` {${options.actualType}} to be {${options.expectedType}}`
  }

  return test('given `blueprint`', {
    'when a blueprint is constructed with a name, and a blueprint, it should return a `validate` function': (expect) => {
      const actual = blueprint('sut', {
        requiredString: 'string',
        optionalString: 'string?'
      })

      expect(typeof actual.validate).to.equal('function')
    },
    'when a blueprint is constructed with an invalid name, it should throw': (expect) => {
      expect(() => blueprint({
        requiredString: 'string',
        optionalString: 'string?'
      })).to.throw(Error, 'blueprint requires a name {string}, and a schema {object}')
    },
    'when a blueprint is constructed with an invalid blueprint, it should throw': (expect) => {
      expect(() => blueprint('sut'))
        .to.throw(Error, 'blueprint requires a name {string}, and a schema {object}')
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
        expect(actual.err.message).to.equal(`Invalid sut: ${makeErrorMessage({
          key: 'requiredString',
          actualType: 'null',
          expectedType: 'string'
        })}, ${makeErrorMessage({
          key: 'optionalString',
          actualType: 'number',
          expectedType: 'string'
        })}`)
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
        expect(actual.err.message).to.equal(`Invalid sut: ${makeErrorMessage({
          key: 'grandParent.parent.child.requiredString',
          actualType: 'null',
          expectedType: 'string'
        })}, ${makeErrorMessage({
          key: 'grandParent.parent.child.optionalString',
          actualType: 'number',
          expectedType: 'string'
        })}`)
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
                return true
              }
            }
          }
        }
      }).validate(expected)

      expect(actual.err).to.be.null
      expect(validatorInput.key).to.equal('grandParent.parent.child.custom')
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
    'when an implementation has **prototype** properties that aren\'t on the blueprint': {
      when: () => {
        class Foo {
          constructor (input) {
            if (!input) {
              throw new Error('input is required')
            }

            this.requiredString = input.requiredString
            this.optionalString = input.optionalString
            this.foo = input.foo
          }

          getVal (key) {
            return this[key]
          }
        }
        return blueprint('sut', {
          requiredString: 'string',
          optionalString: 'string?',
          foo: {
            requiredString: 'string',
            optionalString: 'string?'
          }
        }).validate(new Foo({
          requiredString: 'hello',
          optionalString: 'world',
          foo: new Foo({
            requiredString: 'foo',
            optionalString: 'bar'
          })
        }))
      },
      'the output value should implement the prototype': (expect) => (err, { value }) => {
        expect(err).to.be.null
        expect(value.getVal('requiredString')).to.equal(value.requiredString)
        expect(value.getVal('optionalString')).to.equal(value.optionalString)
        expect(value.getVal('foo').requiredString).to.equal(value.foo.requiredString)
        expect(value.getVal('foo').optionalString).to.equal(value.foo.optionalString)
      },
      'and the implementation uses registerBlueprint': {
        when: () => {
          class Foo {
            constructor (input) {
              if (!input) {
                throw new Error('input is required')
              }

              this.requiredString = input.requiredString
              this.optionalString = input.optionalString
              this.foo = input.foo
            }

            getVal (key) {
              return this[key]
            }
          }

          const bp = registerBlueprint('protosWithRegBp', {
            requiredString: 'string',
            optionalString: 'string?',
            foo: {
              requiredString: 'string',
              optionalString: 'string?'
            }
          })

          return blueprint('sut', {
            bp: {
              requiredString: 'string',
              optionalString: 'string?',
              foo: {
                requiredString: 'string',
                optionalString: 'string?'
              }
            }
          }).validate({
            bp: new Foo({
              requiredString: 'hello',
              optionalString: 'world',
              foo: new Foo({
                requiredString: 'foo',
                optionalString: 'bar'
              })
            })
          })
        },
        'the output value should implement the prototype': (expect) => (err, { value }) => {
          expect(err).to.be.null
          expect(value.bp.getVal('requiredString')).to.equal(value.bp.requiredString)
          expect(value.bp.getVal('optionalString')).to.equal(value.bp.optionalString)
          expect(value.bp.getVal('foo').requiredString).to.equal(value.bp.foo.requiredString)
          expect(value.bp.getVal('foo').optionalString).to.equal(value.bp.foo.optionalString)
        }
      }
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
      expect(actualInvalid.err.message).to.equal('Invalid sut: bad required1232')
      expect(actualInvalid.value).to.be.null
    },
    '`registerValidator`': {
      'it should support adding new validators': (expect) => {
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
        expect(actualInvalid.err.message).to.equal('Invalid sut: Invalid user: expected `firstName` {undefined} to be {string}, expected `lastName` {undefined} to be {string}')
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
          key: 'args',
          value: 'args-value',
          input: { args: 'args-value', other: 'other-value' },
          root: { args: 'args-value', other: 'other-value' }
        })
      },
      'it should return an error if a validator doesn\'t return anything': (expect) => {
        registerValidator('registerValidatorWithNoReturn', () => {})
        const actual = blueprint('sut', {
          something: 'registerValidatorWithNoReturn'
        }).validate({
          something: 'value'
        })

        expect(actual.err).to.not.be.null
        expect(actual.err.message).to.equal('Invalid sut: ValidationError: the validator for `something` didn\'t return a value')
      },
      'should be able to intercept values': (expect) => {
        registerValidator('registerValidatorInterceptor', () => {
          return {
            err: null,
            value: 42
          }
        })
        const actual = blueprint('sut', {
          something: 'registerValidatorInterceptor'
        }).validate({
          something: 'value'
        })

        expect(actual.err).to.be.null
        expect(actual.value.something).to.equal(42)
      },
      'should support boolean validators': (expect) => {
        registerValidator('registerValidator:boolean-validators', ({ key, value }) => {
          return value === 1 ? true : false // eslint-disable-line no-unneeded-ternary
        })

        const bp = blueprint('sut', {
          args: 'registerValidator:boolean-validators'
        })

        expect(bp.validate({ args: 0 }).err).to.not.be.null
        expect(bp.validate({ args: 0 }).err.message).to.equal(`Invalid sut: ${makeErrorMessage({
          key: 'args',
          actualType: 'number',
          expectedType: 'registerValidator:boolean-validators'
        })}`)
        expect(bp.validate({ args: 1 }).err).to.be.null
        expect(bp.validate({ args: 1 }).value.args).to.equal(1)
      },
      'if the validator returns an object and result.value isn\'t set, you\'re bummed': (expect) => {
        registerValidator('registerValidatorWithNoReturn', () => {
          return {
            err: null,
            bvalue: 42
          }
        })
        const actual = blueprint('sut', {
          something: 'registerValidatorWithNoReturn'
        }).validate({
          something: 'value'
        })

        expect(actual.err).to.be.null
        expect(actual.value.something).to.equal(undefined)
      },
      'if the validator throws, it should use the err': (expect) => {
        registerValidator('registerValidator:throws', ({ key, value }) => {
          throw new Error(`I don't like your ${key}:${value}`)
        })

        const bp = blueprint('sut', {
          args: 'registerValidator:throws'
        })

        expect(bp.validate({ args: 0 }).err).to.not.be.null
        expect(bp.validate({ args: 0 }).err.message).to.equal('Invalid sut: I don\'t like your args:0')
      },
      'when given an invalid name, should throw': (expect) => {
        const message = 'registerValidator requires a name {string}, and a validator {function}'

        expect(() => registerValidator(null, () => true))
          .to.throw(Error, message)

        expect(() => registerValidator(() => true))
          .to.throw(Error, message)

        expect(() => registerValidator(1, () => true))
          .to.throw(Error, message)
      },
      'when given an invalid validator, should throw': (expect) => {
        const message = 'registerValidator requires a name {string}, and a validator {function}'

        expect(() => registerValidator('registerValidator:invalid', null))
          .to.throw(Error, message)

        expect(() => registerValidator('registerValidator:invalid'))
          .to.throw(Error, message)

        expect(() => registerValidator('registerValidator:invalid', 1))
          .to.throw(Error, message)
      },
      'should return the validator': (expect) => {
        const validator = registerValidator('registerValidatorReturns', () => { return { value: 42 } })
        expect(validator().value).to.equal(42)
      }
    },
    '`registerType`': {
      'should support boolean validators': (expect) => {
        registerType('registerType:boolean-validators', ({ key, value }) => {
          return value ? true : false // eslint-disable-line no-unneeded-ternary
        })

        const bp = blueprint('sut', {
          args: 'registerType:boolean-validators'
        })

        expect(bp.validate({ args: 0 }).err).to.not.be.null
        expect(bp.validate({ args: 0 }).err.message).to.equal(`Invalid sut: ${makeErrorMessage({
          key: 'args',
          actualType: 'number',
          expectedType: 'registerType:boolean-validators'
        })}`)
        expect(bp.validate({ args: 1 }).err).to.be.null
        expect(bp.validate({ args: 1 }).value.args).to.equal(1)
      },
      'should support {err,value} validators': (expect) => {
        registerType('registerType:{err,value}-validators', ({ key, value }) => {
          return value
            ? {
              err: null,
              value
            }
            : {
              err: new Error(`${key}.... BOOM!`),
              value: null
            }
        })

        const bp = blueprint('sut', {
          args: 'registerType:{err,value}-validators'
        })

        expect(bp.validate({ args: 0 }).err).to.not.be.null
        expect(bp.validate({ args: 0 }).err.message).to.equal('Invalid sut: args.... BOOM!')
        expect(bp.validate({ args: 1 }).err).to.be.null
        expect(bp.validate({ args: 1 }).value.args).to.equal(1)
      },
      'should add instance, nullable instance, array, and nullable array types': (expect) => {
        registerType('registerType:all-the-things', ({ key, value }) => {
          return value === 1 ? true : false // eslint-disable-line no-unneeded-ternary
        })

        const bp = blueprint('sut', {
          required: 'registerType:all-the-things',
          optional: 'registerType:all-the-things?',
          requiredArray: 'registerType:all-the-things[]',
          optionalArray: 'registerType:all-the-things[]?'
        })

        const expected = {
          required: 1,
          optional: 1,
          requiredArray: [1, 1, 1],
          optionalArray: [1, 1, 1]
        }

        const validActual = bp.validate(expected)

        const invalidActual = bp.validate({
          required: 0,
          optional: 0,
          requiredArray: [1, 1, 0],
          optionalArray: [1, 0, 1]
        })

        expect(validActual.err).to.be.null
        expect(validActual.value).to.deep.equal(expected)
        expect(invalidActual.err).to.not.be.null
        expect(invalidActual.err.message).to.equal('Invalid sut: expected `required` {number} to be {registerType:all-the-things}, expected `optional` {number} to be {registerType:all-the-things}, expected `requiredArray[2]` {number} to be {registerType:all-the-things}, expected `optionalArray[1]` {number} to be {registerType:all-the-things}')
      },
      'it should pass `key`, `value`, `input`, and `root` to registered types': (expect) => {
        let actual
        registerType('registerTypeArgs', ({ key, value, input, root }) => {
          actual = { key, value, input, root }
          return { err: null }
        })

        blueprint('sut', {
          args: 'registerTypeArgs'
        }).validate({
          args: 'args-value',
          other: 'other-value'
        })

        expect(actual).to.deep.equal({
          key: 'args',
          value: 'args-value',
          input: { args: 'args-value', other: 'other-value' },
          root: { args: 'args-value', other: 'other-value' }
        })
      },
      'should be able to intercept values': (expect) => {
        registerType('registerTypeInterceptor', ({ value }) => {
          return { err: null, value: value && value.trim() }
        })

        const expected = {
          requiredName: 'whitespace',
          optionalName: 'whitespace',
          requiredArray: ['whitespace'],
          optionalArray: ['whitespace']
        }
        const actual = blueprint('registerTypeInterceptor-test', {
          requiredName: 'registerTypeInterceptor',
          optionalName: 'registerTypeInterceptor?',
          requiredArray: 'registerTypeInterceptor[]',
          optionalArray: 'registerTypeInterceptor[]?'
        }).validate({
          requiredName: '  whitespace ',
          optionalName: '  whitespace ',
          requiredArray: ['  whitespace '],
          optionalArray: ['  whitespace ']
        })

        expect(actual.value).to.deep.equal(expected)
      },
      'when given an invalid name, should throw': (expect) => {
        const message = 'registerType requires a name {string}, and a validator {function}'

        expect(() => registerType(null, () => true))
          .to.throw(Error, message)

        expect(() => registerType(() => true))
          .to.throw(Error, message)

        expect(() => registerType(1, () => true))
          .to.throw(Error, message)
      },
      'when given an invalid validator, should throw': (expect) => {
        const message = 'registerType requires a name {string}, and a validator {function}'

        expect(() => registerType('registerType:invalid', null))
          .to.throw(Error, message)

        expect(() => registerType('registerType:invalid'))
          .to.throw(Error, message)

        expect(() => registerType('registerType:invalid', 1))
          .to.throw(Error, message)
      },
      'should return the validators': (expect) => {
        const types = registerType('registerTypeReturns', ({ value }) => { return { value } })

        expect(types['registerTypeReturns']({ value: 42 }).value).to.equal(42)
        expect(types['registerTypeReturns?']({ value: 42 }).value).to.equal(42)
        expect(types['registerTypeReturns[]']({ value: [42] }).value[0]).to.equal(42)
        expect(types['registerTypeReturns[]?']({ value: [42] }).value[0]).to.equal(42)
      }
    },
    '`registerBlueprint`': {
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
        expect(actualInvalid.err.message).to.equal([
          'Invalid sut:',
          'expected `user.firstName` {undefined} to be {string},',
          'expected `user.lastName` {undefined} to be {string}'
        ].join(' '))
        expect(actualInvalid.value).to.be.null
      },
      'should support null values': (expect) => {
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
      'should support arrays': (expect) => {
        registerBlueprint('registerBlueprint:array:user', {
          firstName: 'string',
          lastName: 'string'
        })
        const bp = blueprint('sut', {
          users: 'registerBlueprint:array:user[]'
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
        expect(actualInvalid.err.message).to.equal('Invalid sut: expected `users[1].lastName` {undefined} to be {string}')
        expect(actualInvalid.value).to.be.null
      },
      'should support nullable arrays': (expect) => {
        registerBlueprint('registerBlueprint:null:array:user', {
          firstName: 'string',
          lastName: 'string'
        })
        const actual = blueprint('sut', {
          users: 'registerBlueprint:null:array:user[]?'
        }).validate({
          users: null
        })

        expect(actual.err).to.be.null
      },
      'should return the blueprint': (expect) => {
        const bp = registerBlueprint('registerBlueprint:returns', {
          firstName: 'string',
          lastName: 'string'
        })
        const expected = {
          firstName: 'John',
          lastName: 'Doe'
        }

        const actual = bp.validate(expected)
        const actualInvalid = bp.validate({
          firstName: 'missing lastName'
        })

        expect(actual.err).to.be.null
        expect(actual.value).to.deep.equal(expected)
        expect(actualInvalid.err).to.not.be.null
        expect(actualInvalid.err.message).to.equal('Invalid registerBlueprint:returns: expected `lastName` {undefined} to be {string}')
        expect(actualInvalid.value).to.be.null
      },
      'when given an invalid name, should throw': (expect) => {
        const message = 'blueprint requires a name {string}, and a schema {object}'

        expect(() => registerBlueprint(null, { str: 'string' }))
          .to.throw(Error, message)

        expect(() => registerBlueprint({ str: 'string' }))
          .to.throw(Error, message)

        expect(() => registerBlueprint(1, { str: 'string' }))
          .to.throw(Error, message)

        expect(() => registerBlueprint(blueprint('name', { str: 'string' })))
          .to.throw(Error, message)
      },
      'when given an invalid schema, should throw': (expect) => {
        const message = 'blueprint requires a name {string}, and a schema {object}'

        expect(() => registerBlueprint('registerBlueprint:invalid', null))
          .to.throw(Error, message)

        expect(() => registerBlueprint('registerBlueprint:invalid'))
          .to.throw(Error, message)

        expect(() => registerBlueprint('registerBlueprint:invalid', 1))
          .to.throw(Error, message)
      },
      'when given another blueprint as the schema, should register that blueprint\'s schema': (expect) => {
        const existing = blueprint('registerBlueprint:invalid:nest', {
          str: 'string'
        })

        const bp = registerBlueprint(
          'registerBlueprint:invalid',
          existing
        )

        expect(bp.validate({ str: 'str' }).err).to.be.null
        expect(bp.validate({ str: 'str' }).value).to.deep.equal({ str: 'str' })
      },
      'should produce comprehensible error messages': (expect) => {
        registerBlueprint('registerBlueprint:user', {
          firstName: 'string',
          lastName: 'string'
        })
        const bp = blueprint('sut', {
          user: 'registerBlueprint:user'
        })

        const actualInvalid = bp.validate({
          firstName: 'missing user object'
        })

        expect(actualInvalid.err).to.not.be.null
        expect(actualInvalid.err.message).to.equal([
          'Invalid sut:',
          'expected `user.firstName` {undefined} to be {string},',
          'expected `user.lastName` {undefined} to be {string}'
        ].join(' '))
        expect(actualInvalid.value).to.be.null
      }
    },
    '`registerExpression`': {
      'should support inline expressions': (expect) => {
        registerExpression('registerExpression:inline', /^book|movie$/i)
        const bp = blueprint('sut', {
          arg: 'registerExpression:inline'
        })

        expect(bp.validate({ arg: 1 }).err).to.not.be.null
        expect(bp.validate({ arg: 1 }).err.message).to.equal('Invalid sut: expected `arg` to match /^book|movie$/i')
        expect(bp.validate({ arg: 'book' }).err).to.be.null
        expect(bp.validate({ arg: 'book' }).value.arg).to.equal('book')
        expect(bp.validate({ arg: 'movie' }).err).to.be.null
        expect(bp.validate({ arg: 'movie' }).value.arg).to.equal('movie')
      },
      'should support expression strings': (expect) => {
        registerExpression('registerExpression:string', '^book$')
        const bp = blueprint('sut', {
          arg: 'registerExpression:string'
        })

        expect(bp.validate({ arg: 1 }).err).to.not.be.null
        expect(bp.validate({ arg: 1 }).err.message).to.equal('Invalid sut: expected `arg` to match /^book$/')
        expect(bp.validate({ arg: 'book' }).err).to.be.null
        expect(bp.validate({ arg: 'book' }).value.arg).to.equal('book')
      },
      'should add instance, nullable instance, array, and nullable array types': (expect) => {
        registerExpression('registerExpression:all-the-things', /^book$/i)

        const bp = blueprint('sut', {
          required: 'registerExpression:all-the-things',
          optional: 'registerExpression:all-the-things?',
          requiredArray: 'registerExpression:all-the-things[]',
          optionalArray: 'registerExpression:all-the-things[]?'
        })

        const expected = {
          required: 'book',
          optional: 'book',
          requiredArray: ['book', 'book', 'book'],
          optionalArray: ['book', 'book', 'book']
        }

        const validActual = bp.validate(expected)

        const invalidActual = bp.validate({
          required: 'movie',
          optional: 'movie',
          requiredArray: ['movie', 'movie', 'movie'],
          optionalArray: ['movie', 'movie', 'movie']
        })

        expect(validActual.err).to.be.null
        expect(validActual.value).to.deep.equal(expected)
        expect(invalidActual.err).to.not.be.null
        expect(invalidActual.err.message).to.equal('Invalid sut: expected `required` to match /^book$/i, expected `optional` to match /^book$/i, expected `requiredArray[0]` to match /^book$/i, expected `requiredArray[1]` to match /^book$/i, expected `requiredArray[2]` to match /^book$/i, expected `optionalArray[0]` to match /^book$/i, expected `optionalArray[1]` to match /^book$/i, expected `optionalArray[2]` to match /^book$/i')
      },
      'when given an invalid name, should throw': (expect) => {
        const message = 'registerExpression requires a name {string}, and an expression {expression}'

        expect(() => registerExpression(null, /^book|movie$/i))
          .to.throw(Error, message)

        expect(() => registerExpression(/^book|movie$/i))
          .to.throw(Error, message)

        expect(() => registerExpression(1, /^book|movie$/i))
          .to.throw(Error, message)
      },
      'when given an invalid expression, should throw': (expect) => {
        const message = 'registerExpression requires a name {string}, and an expression {expression}'

        expect(() => registerExpression('registerExpression:invalid', null))
          .to.throw(Error, message)

        expect(() => registerExpression('registerExpression:invalid'))
          .to.throw(Error, message)

        expect(() => registerExpression('registerExpression:invalid', 1))
          .to.throw(Error, message)
      },
      'should return the validators': (expect) => {
        const types = registerExpression('registerExpressionReturns', /^book$/)

        expect(types['registerExpressionReturns']({ value: 'book' }).value).to.equal('book')
        expect(types['registerExpressionReturns?']({ value: 'book' }).value).to.equal('book')
        expect(types['registerExpressionReturns[]']({ value: ['book'] }).value[0]).to.equal('book')
        expect(types['registerExpressionReturns[]?']({ value: ['book'] }).value[0]).to.equal('book')
      }
    },
    '`optional`': {
      when: () => {
        return blueprint('sut', {
          optionalString: optional('string').withDefault('foo'),
          optionalId: optional('string').withDefault(() => 1),
          optionalGt: optional(gt(10)).withDefault(42),
          optionalExp: optional(/^book|magazine$/).withDefault('book'),
          optionalCustom: optional(({ value }) => {
            return {
              value: value === 0 ? 'zero' : 'something'
            }
          }).withDefault('anything')
        })
      },
      'it should use the default when the value is null': (expect) => (err, bp) => {
        expect(err).to.be.null
        const actual = bp.validate({
          optionalString: null,
          optionalId: null,
          optionalGt: null,
          optionalExp: null,
          optionalCustom: null
        })

        expect(actual.err).to.be.null
        expect(actual.value).to.deep.equal({
          optionalString: 'foo',
          optionalId: 1,
          optionalGt: 42,
          optionalExp: 'book',
          optionalCustom: 'anything'
        })
      },
      'it should use the default when the value is undefined': (expect) => (err, bp) => {
        expect(err).to.be.null
        const actual = bp.validate({})

        expect(actual.err).to.be.null
        expect(actual.value).to.deep.equal({
          optionalString: 'foo',
          optionalId: 1,
          optionalGt: 42,
          optionalExp: 'book',
          optionalCustom: 'anything'
        })
      },
      'it should use the values when the value is defined': (expect) => (err, bp) => {
        expect(err).to.be.null
        const actual = bp.validate({
          optionalString: 'bar',
          optionalId: 'one',
          optionalGt: 12,
          optionalExp: 'magazine',
          optionalCustom: 0
        })

        expect(actual.err).to.be.null
        expect(actual.value).to.deep.equal({
          optionalString: 'bar',
          optionalId: 'one',
          optionalGt: 12,
          optionalExp: 'magazine',
          optionalCustom: 'zero'
        })
      },
      'it should use the given validators': (expect) => (err, bp) => {
        expect(err).to.be.null
        const actual = bp.validate({
          optionalString: 12,
          optionalId: true,
          optionalGt: 8,
          optionalExp: 'movie',
          optionalCustom: 1
        })

        expect(actual.err).to.not.be.null
        expect(actual.err.message).to.equal('Invalid sut: expected `optionalString` {number} to be {string}, expected `optionalId` {boolean} to be {string}, expected `optionalGt` to be greater than 10, expected `optionalExp` to match /^book|magazine$/')
      },
      'it should not validate the default values': (expect) => {
        const bp = blueprint('sut', {
          optionalString: optional('string').withDefault(42)
        })
        const actual = bp.validate({})

        expect(actual.err).to.be.null
        expect(actual.value).to.deep.equal({
          optionalString: 42
        })
      }
    },
    'it should not throw when a null object is validated': (expect) => {
      const actual = blueprint('sut', { string: 'string' })
        .validate()

      expect(actual.err).to.not.be.null
      expect(actual.err.message).to.equal('Invalid sut: expected `string` {undefined} to be {string}')
    }
  })
}

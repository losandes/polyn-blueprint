module.exports = (test) => {
  const { blueprint, registerValidator, registerBlueprint, registerType } = test.sut

  return test('given `blueprint`', {
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
        expect(actual.err.message).to.equal('Invalid sut: sut.requiredString {string} is invalid, sut.optionalString {string} is invalid')
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
        expect(actual.err.message).to.equal('Invalid sut: sut.grandParent.parent.child.requiredString {string} is invalid, sut.grandParent.parent.child.optionalString {string} is invalid')
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
      expect(actualInvalid.err.message).to.equal('Invalid sut: Invalid user: user.firstName {string} is invalid, user.lastName {string} is invalid')
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
    'it should return the input value if the validator doesn\'t return anything': (expect) => {
      registerValidator('registerValidatorWithNoReturn', () => {})
      const actual = blueprint('sut', {
        something: 'registerValidatorWithNoReturn'
      }).validate({
        something: 'value'
      })

      expect(actual.err).to.be.null
      expect(actual.value.something).to.equal('value')
    },
    '`registerValidator` should be able to intercept values': (expect) => {
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
      expect(actualInvalid.err.message).to.equal('Invalid sut: Invalid registerBlueprint:user: registerBlueprint:user.firstName {string} is invalid, registerBlueprint:user.lastName {string} is invalid')
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
      expect(actualInvalid.err.message).to.equal('Invalid sut: All values for sut.users must be {registerBlueprint:array:user}: Invalid registerBlueprint:array:user: registerBlueprint:array:user.lastName {string} is invalid')
      expect(actualInvalid.value).to.be.null
    },
    '`registerBlueprint` should support nullable arrays': (expect) => {
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
    'it should not throw when a null object is validated': (expect) => {
      const actual = blueprint('sut', { string: 'string' })
        .validate()

      expect(actual.err).to.not.be.null
      expect(actual.err.message).to.equal('Invalid sut: sut.string {string} is invalid')
    },
    '`registerType` should support boolean validators': (expect) => {
      registerType('registerType:boolean-validators', ({ key, value }) => {
        return value ? true : false // eslint-disable-line no-unneeded-ternary
      })

      const bp = blueprint('sut', {
        args: 'registerType:boolean-validators'
      })

      expect(bp.validate({ args: 0 }).err).to.not.be.null
      expect(bp.validate({ args: 0 }).err.message).to.equal('Invalid sut: sut.args {registerType:boolean-validators} is required')
      expect(bp.validate({ args: 1 }).err).to.be.null
      expect(bp.validate({ args: 1 }).value.args).to.equal(1)
    },
    '`registerType` should support {err,value} validators': (expect) => {
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
      expect(bp.validate({ args: 0 }).err.message).to.equal('Invalid sut: sut.args.... BOOM!')
      expect(bp.validate({ args: 1 }).err).to.be.null
      expect(bp.validate({ args: 1 }).value.args).to.equal(1)
    },
    '`registerType` should add instance, nullable instance, array, and nullable array types': (expect) => {
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
      expect(invalidActual.err.message).to.equal('Invalid sut: sut.required {registerType:all-the-things} is required, sut.optional must be a registerType:all-the-things if present, All values for sut.requiredArray must be {registerType:all-the-things}: All values for sut.requiredArray must be {registerType:all-the-things}, All values for sut.optionalArray must be {registerType:all-the-things}: All values for sut.optionalArray must be {registerType:all-the-things}')
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
        key: 'sut.args',
        value: 'args-value',
        input: { args: 'args-value', other: 'other-value' },
        root: { args: 'args-value', other: 'other-value' }
      })
    },
    '`registerType` should be able to intercept values': (expect) => {
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
    }
  })
}

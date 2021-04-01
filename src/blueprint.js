module.exports = {
  name: 'blueprint',
  factory: (is) => {
    'use strict'
    const validators = {}

    class ValueOrError {
      constructor (input) {
        this.err = input.err || null
        this.value = is.defined(input.value) ? input.value : null

        if (is.array(input.messages)) {
          this.messages = input.messages
        } else if (input.err) {
          this.messages = [input.err.message]
        } else {
          this.messages = null
        }

        Object.freeze(this)
      }
    }

    class ValidationContext {
      constructor (input) {
        this.key = input.key
        this.value = input.value
        this.input = input.input
        this.root = input.root
        this.output = input.output
        this.schema = input.schema
      }
    }

    class Blueprint {
      constructor (input) {
        this.name = input.name
        this.schema = input.schema
        this.validate = input.validate

        Object.freeze(this)
      }
    }

    /**
     * Makes a message factory that produces an error message on demand
     * @param {string} options.key - the property name
     * @param {any} options.value - the value being validated
     * @param {any} options.input - the object being validated
     * @param {any?} options.schema - the type definitions
     * @param {string?} options.type - the type this key should be
     */
    const makeDefaultErrorMessage = (options) => () => {
      options = options || {}

      const key = options.key
      const value = Object.keys(options).includes('value')
        ? options.value
        : options.input && options.input[key]
      const actualType = is.getType(value)
      const expectedType = options.type || (options.schema && options.schema[key])

      return `expected \`${key}\` {${actualType}} to be {${expectedType}}`
    }

    /**
     * Support for ad-hoc polymorphism for `isValid` functions: they can throw,
     * return boolean, or return { isValid: 'boolean', value: 'any', message: 'string[]' }.
     * @curried
     * @param {function} isValid - the validation function
     * @param {ValidationContext} context - the validation context
     * @param {function} defaultMessageFactory - the default error message
     */
    const normalIsValid = (isValid) => (context, defaultMessageFactory) => {
      try {
        const result = isValid(context)

        if (is.boolean(result)) {
          return result
            ? new ValueOrError({ value: context.value })
            : new ValueOrError({ err: new Error(defaultMessageFactory()) })
        } else if (result) {
          return {
            err: result.err,
            value: result.value,
          }
        } else {
          return new ValueOrError({
            err: new Error(`ValidationError: the validator for \`${context.key}\` didn't return a value`),
          })
        }
      } catch (err) {
        return new ValueOrError({ err })
      }
    }

    /**
     * If the caller passes in an instance of a class, or a function that
     * has prototype values, we shouldn't strip those away. Try to create
     * an object from the input's prototype, and return a plain object if
     * that fails
     * @param {any} input - the input that was passed to `validate`
     */
    const tryMakeFromProto = (input) => {
      try {
        return Object.create(Object.getPrototypeOf(input))
      } catch (e) {
        return {}
      }
    }

    /**
     * Validates the input values against the schema expectations
     * @curried
     * @param {string} name - the name of the model being validated
     * @param {object} schema - the type definitions
     * @param {object} input - the values being validated
     */
    const validate = (name, schema) => (input, root) => {
      const outcomes = Object.keys(schema).reduce((output, key) => {
        const keyName = root ? `${name}.${key}` : key

        if (is.object(schema[key])) {
          const child = validate(`${keyName}`, schema[key])(input[key], root || input)

          if (child.err) {
            output.validationErrors = output.validationErrors.concat(child.messages)
          }

          output.value[key] = child.value
          return output
        }

        let validator

        if (is.function(schema[key])) {
          validator = normalIsValid(schema[key])
        } else if (is.regexp(schema[key])) {
          validator = normalIsValid(validators.expression(schema[key]))
        } else {
          validator = validators[schema[key]]
        }

        if (is.not.function(validator)) {
          output.validationErrors.push(`I don't know how to validate ${schema[key]}`)
          return output
        }

        const context = new ValidationContext({
          key: `${keyName}`,
          value: input && input[key],
          input,
          root: root || input,
          output: output.value,
          schema,
        })

        const result = validator(context, makeDefaultErrorMessage(context))

        if (result && result.err) {
          output.validationErrors.push(result.err.message)
          return output
        }

        output.value[key] = result ? result.value : input[key]
        return output
      }, { /* output */
        validationErrors: [],
        value: tryMakeFromProto(input),
      }) // /reduce

      if (outcomes.validationErrors.length) {
        return new ValueOrError({
          err: new Error(`Invalid ${name}: ${outcomes.validationErrors.join(', ')}`),
          messages: outcomes.validationErrors,
        })
      }

      return new ValueOrError({ value: outcomes.value })
    } // /validate

    /**
    * Returns a validator (fluent interface) for validating the input values
    * against the schema expectations
    * @param {string} name - the name of the model being validated
    * @param {object} schema - the type definitions
    * @param {object} validate.input - the values being validated
    */
    const blueprint = (name, schema) => {
      if (is.not.string(name) || is.not.object(schema)) {
        throw new Error('blueprint requires a name {string}, and a schema {object}')
      }

      return new Blueprint({
        name,
        schema,
        validate: validate(name, schema),
      })
    }

    /**
     * Registers a validator by name, so it can be used in blueprints
     * @param {string} name - the name of the validator
     * @param {function} validator - the validator
     */
    const registerValidator = (name, validator) => {
      if (is.not.string(name) || is.not.function(validator)) {
        throw new Error('registerValidator requires a name {string}, and a validator {function}')
      }

      if (name === 'expression') {
        validators[name] = validator
      } else {
        validators[name] = normalIsValid(validator)
      }

      return validator
    } // /registerValidator

    /**
     * Registers a validator, and a nullable validator by the given name, using
     * the given isValid function
     * @param {string} name - the name of the type
     * @param {function} isValid - the validator for testing one instance of this type (must return truthy/falsey)
     */
    const registerInstanceOfType = (name, isValid) => {
      const test = normalIsValid(isValid)

      return [
        // required
        registerValidator(name, (context) => {
          const { key } = context
          return test(context, makeDefaultErrorMessage({
            key,
            value: context.value,
            type: name,
          }))
        }),
        // nullable
        registerValidator(`${name}?`, (context) => {
          const { key, value } = context
          if (is.nullOrUndefined(value)) {
            return { err: null, value: value }
          } else {
            return test(context, makeDefaultErrorMessage({
              key,
              value: context.value,
              type: name,
            }))
          }
        }),
      ]
    }

    /**
     * Registers an array validator, and a nullable array validator by the given
     * name, using the given isValid function
     * @param {string} name - the name of the type
     * @param {function} isValid - the validator for testing one instance of this type (must return truthy/falsey)
     */
    const registerArrayOfType = (instanceName, arrayName, isValid) => {
      const test = normalIsValid(isValid)

      const validateMany = (context, errorMessageFactory) => {
        if (is.not.array(context.value)) {
          return { err: new Error(errorMessageFactory()), value: null }
        }

        const errors = []
        const values = []

        context.value.forEach((value, index) => {
          const key = `${context.key}[${index}]`
          const result = test({
            key,
            value,
            input: context.input,
            root: context.root,
          }, makeDefaultErrorMessage({
            key,
            value,
            type: instanceName,
          }))

          if (result.err) {
            // make sure the array key[index] is in the error message
            const message = result.err.message.indexOf(`[${index}]`) > -1
              ? result.err.message
              : `(\`${key}\`) ${result.err.message}`
            return errors.push(message)
          }

          return values.push(result.value)
        })

        if (errors.length) {
          return { err: new Error(errors.join(', ')), value: null }
        }

        return { err: null, value: values }
      }

      return [
        // required
        registerValidator(arrayName, (context) => {
          const { key } = context

          return validateMany(
            context,
            makeDefaultErrorMessage({ key, value: context.value, type: arrayName }),
          )
        }),

        // nullable
        registerValidator(`${arrayName}?`, (context) => {
          const { key, value } = context

          if (is.nullOrUndefined(value)) {
            return { err: null, value: value }
          } else {
            return validateMany(
              context,
              makeDefaultErrorMessage({ key, value: context.value, type: arrayName }),
            )
          }
        }),
      ]
    }

    /**
     * Registers a validator, a nullable validator, an array validator, and
     * a nullable array validator based on the given name, using the
     * given validator function
     * @param {string} name - the name of the type
     * @param {function} validator - the validator for testing one instance of this type (must return truthy/falsey)
     */
    const registerType = (name, validator) => {
      if (is.not.string(name) || is.not.function(validator)) {
        throw new Error('registerType requires a name {string}, and a validator {function}')
      }

      registerInstanceOfType(name, validator)
      registerArrayOfType(name, `${name}[]`, validator)

      const output = {}

      output[name] = validators[name]
      output[`${name}?`] = validators[`${name}?`]
      output[`${name}[]`] = validators[`${name}[]`]
      output[`${name}[]?`] = validators[`${name}[]?`]

      return output
    }

    /**
     * Registers a blueprint that can be used as a validator
     * @param {string} name - the name of the model being validated
     * @param {object} schema - the type definitions
     */
    const registerBlueprint = (name, schema) => {
      let bp

      if (schema && schema.schema) {
        // this must be an instance of a blueprint
        bp = blueprint(name, schema.schema)
      } else {
        bp = blueprint(name, schema)
      }

      const cleanMessage = (key, message) => {
        return message.replace(`Invalid ${bp.name}: `, '')
          .replace(/expected `/g, `expected \`${key}.`)
      }

      registerType(bp.name, ({ key, value }) => {
        const result = bp.validate(value)

        if (result.err) {
          result.err.message = cleanMessage(key, result.err.message)
        }

        return result
      })

      return bp
    }

    /**
     * Registers a regular expression validator by name, so it can be used in blueprints
     * @param {string} name - the name of the validator
     * @param {string|RegExp} expression - the expression that will be  used to validate the values
     */
    const registerExpression = (name, expression) => {
      if (is.not.string(name) || (is.not.regexp(expression) && is.not.string(expression))) {
        throw new Error('registerExpression requires a name {string}, and an expression {expression}')
      }

      const regex = is.string(expression) ? new RegExp(expression) : expression

      return registerType(name, ({ key, value }) => {
        return regex.test(value) === true
          ? new ValueOrError({ value: value })
          : new ValueOrError({ err: new Error(`expected \`${key}\` to match ${regex.toString()}`) })
      })
    }

    const getValidators = () => {
      return { ...validators }
    }

    const getValidator = (name) => {
      if (!validators[name]) {
        return
      }

      return { ...validators[name] }
    }

    const comparatorToValidator = (comparator) => {
      let validator

      if (is.function(comparator)) {
        validator = normalIsValid(comparator)
      } else if (is.regexp(comparator)) {
        validator = normalIsValid(validators.expression(comparator))
      } else {
        validator = validators[comparator]
      }

      return validator
    }

    /**
     * Fluent interface to support optional function based validators
     * (i.e. like gt, lt, range, custom), and to use default values when
     * the value presented is null, or undefined.
     * @param {any} comparator - the name of the validator, or a function that performs validation
     */
    const optional = (comparator) => {
      let defaultVal
      let from
      const validator = comparatorToValidator(comparator)

      const valueOrDefaultValue = (value) => {
        if (is.function(defaultVal)) {
          return { value: defaultVal() }
        } else if (is.defined(defaultVal)) {
          return { value: defaultVal }
        } else {
          return { value }
        }
      }

      const output = (ctx) => {
        let context

        if (from) {
          context = {
            ...ctx,
            ...{
              value: from(ctx),
            },
          }
        } else {
          context = ctx
        }

        const { value } = context
        if (is.nullOrUndefined(value)) {
          return valueOrDefaultValue(value)
        } else {
          return validator(context)
        }
      }

      /**
       * A value factory for producing a value, given the constructor context
       * @param {function} callback - a callback function that accepts IValidationContext and produces a value
       */
      output.from = (callback) => {
        if (is.function(callback)) {
          from = callback
        }

        return output
      }

      /**
       * Sets a default value to be used when a value is not given for this property
       * @param {any} defaultValue - the value to use when this property is null or undefined
       */
      output.withDefault = (defaultValue) => {
        defaultVal = defaultValue
        return output
      }

      return output
    }

    /**
     * Fluent interface to support optional function based validators
     * (i.e. like gt, lt, range, custom), and to use default values when
     * the value presented is null, or undefined.
     * @param {any} comparator - the name of the validator, or a function that performs validation
     */
    const required = (comparator) => {
      let from
      const validator = comparatorToValidator(comparator)

      const output = (ctx) => {
        let context

        if (from) {
          context = {
            ...ctx,
            ...{
              value: from(ctx),
            },
          }
        } else {
          context = ctx
        }

        return validator(context)
      }

      /**
       * A value factory for producing a value, given the constructor context
       * @param {function} callback - a callback function that accepts IValidationContext and produces a value
       */
      output.from = (callback) => {
        if (is.function(callback)) {
          from = callback
        }

        return output
      }

      return output
    }

    return {
      blueprint,
      registerValidator,
      registerType,
      registerBlueprint,
      registerExpression,
      optional,
      required,
      // below are undocumented / subject to breaking changes
      registerInstanceOfType,
      registerArrayOfType,
      getValidators,
      getValidator,
    }
  },
}

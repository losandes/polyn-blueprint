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

    class Blueprint {
      constructor (input) {
        this.name = input.name
        this.schema = input.schema
        this.validate = input.validate

        Object.freeze(this)
      }
    }

    /**
     * Support for ad-hoc polymorphism for `isValid` functions: they can throw,
     * return boolean, or return { isValid: 'boolean', value: 'any', message: 'string[]' }.
     * @param {function} isValid
     */
    const normalIsValid = (isValid) => (context, defaultErrorMessage) => {
      try {
        const result = isValid(context)

        if (is.boolean(result)) {
          return result
            ? new ValueOrError({ value: context.value })
            : new ValueOrError({ err: new Error(defaultErrorMessage) })
        } else if (result) {
          return {
            err: result.err,
            value: result.value
          }
        } else {
          return new ValueOrError({
            err: new Error(`ValidationError: the validator for ${context.key} didn't return a value`)
          })
        }
      } catch (err) {
        return new ValueOrError({ err })
      }
    }

    /**
     * Validates the input values against the blueprint expectations
     * @curried
     * @param {string} name - the name of the model being validated
     * @param {object} blueprint - the type definitions
     * @param {object} input - the values being validated
     */
    const validate = (name, blueprint) => (input, root) => {
      const outcomes = Object.keys(blueprint).reduce((output, key) => {
        if (is.object(blueprint[key])) {
          const child = validate(`${name}.${key}`, blueprint[key])(input[key], root || input)

          if (child.err) {
            output.validationErrors = output.validationErrors.concat(child.messages)
          }

          output.value[key] = child.value
          return output
        }

        let validator

        if (is.function(blueprint[key])) {
          validator = normalIsValid(blueprint[key])
        } else if (is.regexp(blueprint[key])) {
          validator = normalIsValid(validators.expression(blueprint[key]))
        } else {
          validator = validators[blueprint[key]]
        }

        if (is.not.function(validator)) {
          output.validationErrors.push(`I don't know how to validate ${blueprint[key]}`)
          return output
        }

        const result = validator({
          key: `${name}.${key}`,
          value: input && input[key],
          input,
          root: root || input
        }, `${name}.${key} is invalid`)

        if (result && result.err) {
          output.validationErrors.push(result.err.message)
          return output
        }

        output.value[key] = result ? result.value : input[key]
        return output
      }, { validationErrors: [], value: {} })

      if (outcomes.validationErrors.length) {
        return new ValueOrError({
          err: new Error(`Invalid ${name}: ${outcomes.validationErrors.join(', ')}`),
          messages: outcomes.validationErrors
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
        validate: validate(name, schema)
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
          return test(context, `${key} {${name}} is required`)
        }),
        // nullable
        registerValidator(`${name}?`, (context) => {
          const { key, value } = context
          if (is.nullOrUndefined(value)) {
            return { err: null, value: value }
          } else {
            return test(context, `${key} must be a ${name} if present`)
          }
        })
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

      const validateMany = (context, allMessage, oneErrorMessage) => {
        if (is.not.array(context.value)) {
          return { err: new Error(allMessage), value: null }
        }

        const errors = []
        const values = []

        context.value.forEach((val, index) => {
          const result = test({
            key: `${context.key}[${index}]`,
            value: val,
            input: context.input,
            root: context.root
          }, oneErrorMessage)

          if (result.err) {
            return errors.push(result.err.message)
          }

          return values.push(result.value)
        })

        if (errors.length) {
          return { err: new Error(`${oneErrorMessage}: ${errors.join(', ')}`), value: null }
        }

        return { err: null, value: values }
      }

      return [
        // required
        registerValidator(arrayName, (context) => {
          const { key } = context

          return validateMany(
            context,
            `${key} {${arrayName}} is required`,
            `All values for ${key} must be {${instanceName}}`
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
              `${key} {${arrayName}} must be an array`,
              `All values for ${key} must be {${instanceName}}`
            )
          }
        })
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

      if (bp.err) {
        throw bp.err
      }

      registerType(bp.name, ({ value }) => {
        return bp.validate(value)
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
          : new ValueOrError({ err: new Error(`${key} does not match ${regex.toString()}`) })
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

    return {
      blueprint,
      registerValidator,
      registerType,
      registerBlueprint,
      registerExpression,
      // below are undocumented / subject to breaking changes
      registerInstanceOfType,
      registerArrayOfType,
      getValidators,
      getValidator
    }
  }
}

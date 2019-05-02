module.exports = {
  name: 'blueprint',
  factory: (is) => {
    'use strict'
    const validators = {}

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
          validator = blueprint[key]
        } else if (is.regexp(blueprint[key])) {
          validator = validators.expression(blueprint[key])
        } else {
          validator = validators[blueprint[key]]
        }

        if (!validator) {
          output.validationErrors.push(`I don't know how to validate ${blueprint[key]}`)
          return output
        }

        const result = validator({
          key: `${name}.${key}`,
          value: input && input[key],
          input,
          root: root || input
        })

        if (result && result.err) {
          output.validationErrors.push(result.err.message)
          return output
        }

        output.value[key] = result ? result.value : input[key]
        return output
      }, { validationErrors: [], value: {} })

      if (outcomes.validationErrors.length) {
        return {
          err: new Error(`Invalid ${name}: ${outcomes.validationErrors.join(', ')}`),
          messages: outcomes.validationErrors,
          value: null
        }
      }

      return {
        err: null,
        messages: null,
        value: outcomes.value
      }
    } // /validate

    /**
    * Returns a validator (fluent interface) for validating the input values
    * against the blueprint expectations
    * @param {string} name - the name of the model being validated
    * @param {object} blueprint - the type definitions
    * @param {object} validate.input - the values being validated
    */
    const blueprint = (name, blueprint) => {
      if (is.not.string(name) || is.not.object(blueprint)) {
        return {
          err: new Error('blueprint requires a name {string}, and a blueprint {object}'),
          value: null
        }
      }

      return {
        err: null,
        name,
        validate: validate(name, blueprint)
      }
    }

    /**
     * Registers a validator by name, so it can be used in blueprints
     * @param {string} name - the name of the validator
     * @param {function} validator - the validator
     */
    const registerValidator = (name, validator) => {
      if (is.not.string(name) || is.not.function(validator)) {
        const message = 'registerValidator requires a name {string}, and a validator {function}'
        return {
          err: new Error(message),
          messages: [message],
          value: null
        }
      }

      validators[name] = validator

      return {
        err: null,
        messages: null,
        value: validator
      }
    } // /registerValidator

    /**
     * Support for ad-hoc polymorphism for `isValid` functions: they can
     * return boolean, or { isValid: 'boolean', value: 'any', message: 'string' }
     * @param {function} isValid
     */
    const normalIsValid = (isValid) => (context, defaultErrorMessage) => {
      const result = isValid(context)

      if (typeof result === 'boolean') {
        return result
          ? { err: null, value: context.value }
          : { err: new Error(defaultErrorMessage), value: null }
      }

      return {
        err: result.err,
        value: result.value
      }
    }

    /**
     * Registers a validator, and a nullable validator by the given name, using
     * the given isValid function
     * @param {string} name - the name of the type
     * @param {function} isValid - the validator for testing one instance of this type (must return truthy/falsey)
     */
    const registerInstanceOfType = (name, isValid) => {
      const test = normalIsValid(isValid)

      // required
      registerValidator(name, (context) => {
        const { key } = context
        return test(context, `${key} {${name}} is required`)
      })

      // nullable
      registerValidator(`${name}?`, (context) => {
        const { key, value } = context
        if (is.nullOrUndefined(value)) {
          return { err: null, value: value }
        } else {
          return test(context, `${key} must be a ${name} if present`)
        }
      })
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

      // required
      registerValidator(arrayName, (context) => {
        const { key } = context

        return validateMany(
          context,
          `${key} {${arrayName}} is required`,
          `All values for ${key} must be {${instanceName}}`
        )
      })

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
        const message = 'registerType requires a name {string}, and a validator {function}'
        return {
          err: new Error(message),
          messages: [message],
          value: null
        }
      }

      registerInstanceOfType(name, validator)
      registerArrayOfType(name, `${name}[]`, validator)

      return { err: null }
    }

    /**
     * Registers a blueprint that can be used as a validator
     * @param {string} name - the name of the model being validated
     * @param {object} blueprint - the type definitions
     */
    const registerBlueprint = (name, definition) => {
      const bp = blueprint(name, definition)

      if (bp.err) {
        return bp
      }

      return registerType(bp.name, ({ value }) => {
        return bp.validate(value)
      })
    }

    const getValidators = () => {
      return { ...validators }
    }

    return {
      blueprint,
      registerValidator,
      registerType,
      registerBlueprint,
      // below are undocumented / subject to breaking changes
      registerInstanceOfType,
      registerArrayOfType,
      getValidators
    }
  }
}

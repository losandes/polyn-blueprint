// Node, or global
;(function (root, factory) { // eslint-disable-line no-extra-semi
  if (typeof exports === 'object') {
    // Node.
    // This doesn't work with strict CommonJS, but does with CommonJS-like
    // enviroments that support module.exports, like Node.
    const blueprint = factory(require('./is.js'))
    blueprint.Blueprint = factory
    module.exports = blueprint
  } else {
    // Browser globals (root is self)
    root.polyn = root.polyn || {}
    const blueprint = factory(root.polyn.is)
    blueprint.Blueprint = factory
    root.polyn.blueprint = blueprint
  }
}(this, function (is) {
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

      output.value[key] = input[key]
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
  }

  /**
   * Registers a blueprint that can be used as a validator
   * @param {string} name - the name of the validator
   * @param {IBlueprint} blueprint - the blueprint
   */
  const registerBlueprint = (name, bp) => {
    const arrayName = `array<${name}>`
    const validateOne = ({ value }) => {
      const validation = bp.validate(value)

      if (validation.err) {
        return { err: validation.err, value: null }
      }

      return { err: null, value: validation.value }
    }
    const validateMany = ({ value }) => {
      if (is.not.array(value)) {
        return { err: new Error(`${arrayName} {array} is required`), value: null }
      } else if (value.filter((val) => validateOne({ value: val }).err).length) {
        return { err: new Error(`All values for ${arrayName} must be of type, '${name}'`), value: null }
      } else {
        return { err: null, value: value }
      }
    }

    registerValidator(name, validateOne)
    registerValidator(`${name}?`, ({ value }) => {
      if (is.nullOrUndefined(value)) {
        return { err: null, value
        }
      }

      return validateOne({ value })
    })
    registerValidator(arrayName, validateMany)
    registerValidator(`${arrayName}?`, ({ value }) => {
      if (is.nullOrUndefined(value)) {
        return { err: null, value: value }
      }

      return validateMany({ value })
    })
  }

  const register = (isKey, scrub) => {
    scrub = is.function(scrub) ? scrub : (input) => input

    registerValidator(isKey, ({ key, value }) => {
      return is[isKey](value)
        ? { err: null, value: scrub(value) }
        : { err: new Error(`${key} {${isKey}} is required`), value: null }
    })

    registerValidator(`${isKey}?`, ({ key, value }) => {
      if (is.nullOrUndefined(value)) {
        return { err: null, value: scrub(value) }
      } else if (is[isKey](value)) {
        return { err: null, value: scrub(value) }
      } else {
        return {
          err: new Error(`${key} must be a ${isKey} if present`),
          value: null
        }
      }
    })
  }

  const registerArrayOfType = (isKey) => {
    const name = `array<${isKey}>`

    registerValidator(name, ({ key, value }) => {
      if (is.not.array(value)) {
        return { err: new Error(`${key} {${name}} is required`), value: null }
      } else if (value.filter((val) => is.not[isKey](val)).length) {
        return { err: new Error(`All values for ${key} must be of type, '${isKey}'`), value: null }
      } else {
        return { err: null, value: value }
      }
    })

    registerValidator(`${name}?`, ({ key, value }) => {
      if (is.nullOrUndefined(value)) {
        return { err: null, value: value }
      } else if (is.not.array(value)) {
        return { err: new Error(`${key} {${name}} is required`), value: null }
      } else if (value.filter((val) => is.not[isKey](val)).length) {
        return { err: new Error(`All values for ${key} must be of type, '${isKey}'`), value: null }
      } else {
        return { err: null, value: value }
      }
    })
  }

  const types = [
    'function',
    'object',
    'array',
    'boolean',
    'date',
    'number',
    'decimal',
    'regexp'
    // 'string', // registered separately with a trimmer
  ]

  types.forEach((type) => {
    register(type)
    registerArrayOfType(type)
  })
  register('string', (input) => is.string(input) ? input.trim() : input)
  registerArrayOfType('string')

  // support up to 15 decimal places for decimal precision
  for (let i = 1; i <= 15; i += 1) {
    registerValidator(`decimal:${i}`, ({ key, value }) => {
      return is.decimal(value, i)
        ? { err: null, value: value }
        : { err: new Error(`${key} {decimal} is required, and must have ${i} places`), value: null }
    })

    registerValidator(`decimal:${i}?`, ({ key, value }) => {
      if (is.nullOrUndefined(value)) {
        return { err: null, value: value }
      } else if (is.decimal(value, i)) {
        return { err: null, value: value }
      } else {
        return {
          err: new Error(`${key} must be a decimal with ${i} places if present`),
          value: null
        }
      }
    })
  }

  registerValidator('expression', (regex) => ({ key, value }) => {
    return regex.test(value) === true
      ? { err: null, value: value }
      : { err: new Error(`${key} does not match ${regex.toString()}`), value: null }
  })

  return Object.freeze({ blueprint, registerValidator, registerBlueprint })
}))

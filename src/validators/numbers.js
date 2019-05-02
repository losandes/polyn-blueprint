module.exports = {
  name: 'numberValidators',
  factory: () => {
    'use strict'

    const gt = (min) => ({ key, value }) => {
      if (value > min) {
        return {
          err: null,
          value
        }
      }

      return {
        err: new Error(`${key} must be greater than ${min}`),
        value: null
      }
    }

    const gte = (min) => ({ key, value }) => {
      if (value >= min) {
        return {
          err: null,
          value
        }
      }

      return {
        err: new Error(`${key} must be greater than, or equal to ${min}`),
        value: null
      }
    }

    const lt = (max) => ({ key, value }) => {
      if (value < max) {
        return {
          err: null,
          value
        }
      }

      return {
        err: new Error(`${key} must be less than ${max}`),
        value: null
      }
    }

    const lte = (max) => ({ key, value }) => {
      if (value <= max) {
        return {
          err: null,
          value
        }
      }

      return {
        err: new Error(`${key} must be less than, or equal to ${max}`),
        value: null
      }
    }

    const range = (options) => {
      if (!options) {
        throw new Error('You must specify a range')
      } else if (isNaN(options.gt) && isNaN(options.gte)) {
        throw new Error('You must specify `gt`, or `gte` {number} when defining a range')
      } else if (isNaN(options.lt) && isNaN(options.lte)) {
        throw new Error('You must specify `lt`, or `lte` {number} when defining a range')
      }

      const gtExpression = options.gt ? gt(options.gt) : gte(options.gte)
      const ltExpression = options.lt ? lt(options.lt) : lte(options.lte)

      return (input) => {
        const ltOutcome = ltExpression(input)

        if (ltOutcome.err) {
          return ltOutcome
        }

        return gtExpression(input)
      }
    }

    return {
      gt,
      gte,
      lt,
      lte,
      range
    }
  }
}

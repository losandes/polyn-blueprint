module.exports = {
  name: 'numberValidators',
  factory: (is) => {
    'use strict'

    const makeErrorMessage = (options) => {
      return `expected \`${options.key}\` to be ${options.comparator} ${options.boundary}`
    }

    const gt = (min) => {
      if (is.not.number(min)) {
        throw new Error('gt requires a minimum number to compare values to')
      }

      return ({ key, value }) => {
        if (is.number(value) && value > min) {
          return {
            err: null,
            value,
          }
        }

        return {
          err: new Error(makeErrorMessage({ key, comparator: 'greater than', boundary: min })),
          value: null,
        }
      }
    }

    const gte = (min) => {
      if (is.not.number(min)) {
        throw new Error('gte requires a minimum number to compare values to')
      }

      return ({ key, value }) => {
        if (is.number(value) && value >= min) {
          return {
            err: null,
            value,
          }
        }

        return {
          err: new Error(makeErrorMessage({ key, comparator: 'greater than, or equal to', boundary: min })),
          value: null,
        }
      }
    }

    const lt = (max) => {
      if (is.not.number(max)) {
        throw new Error('lt requires a maximum number to compare values to')
      }

      return ({ key, value }) => {
        if (is.number(value) && value < max) {
          return {
            err: null,
            value,
          }
        }

        return {
          err: new Error(makeErrorMessage({ key, comparator: 'less than', boundary: max })),
          value: null,
        }
      }
    }

    const lte = (max) => {
      if (is.not.number(max)) {
        throw new Error('lte requires a maximum number to compare values to')
      }

      return ({ key, value }) => {
        if (is.number(value) && value <= max) {
          return {
            err: null,
            value,
          }
        }

        return {
          err: new Error(makeErrorMessage({ key, comparator: 'less than, or equal to', boundary: max })),
          value: null,
        }
      }
    }

    const range = (options) => {
      if (!options) {
        throw new Error('You must specify a range')
      } else if (is.not.number(options.gt) && is.not.number(options.gte)) {
        throw new Error('You must specify `gt`, or `gte` {number} when defining a range')
      } else if (is.not.number(options.lt) && is.not.number(options.lte)) {
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

    const optional = (comparator) => (input) => {
      const validator = comparator(input)

      return (context) => {
        const { value } = context
        if (is.nullOrUndefined(value)) {
          return { value }
        } else {
          return validator(context)
        }
      }
    }

    return {
      gt,
      gte,
      lt,
      lte,
      range,
      // backward compatibility - can be removed in v3
      __optional: {
        gt: optional(gt),
        gte: optional(gte),
        lt: optional(lt),
        lte: optional(lte),
        range: optional(range),
      },
    }
  },
}

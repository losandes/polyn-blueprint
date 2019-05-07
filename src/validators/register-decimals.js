module.exports = {
  name: 'registerDecimals',
  factory: (is, Blueprint) => {
    'use strict'

    const { registerValidator } = Blueprint

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
  }
}

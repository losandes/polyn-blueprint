module.exports = ({ is, InvalidValueError }) => {
  const lt = (min) => {
    if (is.not.number(min)) {
      throw new Error('lt requires a minimum number to compare values to')
    }

    return ({ key, value }) => {
      if (is.number(value) && value < min) {
        return { err: null, value }
      }

      return {
        err: new InvalidValueError({
          key,
          value,
          message: `expected \`${key}\` to be less than ${min}`,
          code: 'invalid_lt',
          assertion: `is.number(${value}) && ${value} < ${min}`,
        }),
      }
    }
  }

  return { lt }
}

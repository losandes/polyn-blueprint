module.exports = ({ is, InvalidValueError }) => {
  const gte = (min) => {
    if (is.not.number(min)) {
      throw new Error('gte requires a minimum number to compare values to')
    }

    return ({ key, value }) => {
      if (is.number(value) && value >= min) {
        return { err: null, value }
      }

      return {
        err: new InvalidValueError({
          key,
          value,
          message: `expected \`${key}\` to be greater than or equal to ${min}`,
          code: 'invalid_gte',
          assertion: `is.number(${value}) && ${value} >= ${min}`,
        }),
      }
    }
  }

  return { gte }
}

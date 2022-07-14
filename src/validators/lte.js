module.exports = ({ is, InvalidValueError }) => {
  const lte = (min) => {
    if (is.not.number(min)) {
      throw new Error('lte requires a minimum number to compare values to')
    }

    return ({ key, value }) => {
      if (is.number(value) && value <= min) {
        return { err: null, value }
      }

      return {
        err: new InvalidValueError({
          key,
          value,
          message: `expected \`${key}\` to be less than or equal to ${min}`,
          code: 'invalid_lte',
          assertion: `is.number(${value}) && ${value} <= ${min}`,
        }),
      }
    }
  }

  return { lte }
}

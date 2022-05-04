module.exports = ({ is, InvalidValueError }) => {
  const gt = (min) => {
    if (is.not.number(min)) {
      throw new Error('gt requires a minimum number to compare values to')
    }

    return ({ key, value }) => {
      if (is.number(value) && value > min) {
        return { err: null, value }
      }

      return {
        err: new InvalidValueError({
          key,
          value,
          message: `expected \`${key}\` to be greater than ${min}`,
          code: 'invalid_gt',
          assertion: `is.number(${value}) && ${value} > ${min}`,
        }),
      }
    }
  }

  return { gt }
}

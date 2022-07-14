module.exports = ({ is, gt, gte, lt, lte }) => {
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

  return { range }
}

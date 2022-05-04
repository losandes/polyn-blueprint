module.exports = function Factory (is) {
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

  return { optional }
}

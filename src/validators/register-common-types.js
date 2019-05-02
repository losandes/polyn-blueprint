module.exports = {
  name: 'registerCommonTypes',
  factory: (is, { registerType }) => {
    const types = [
      'function',
      'object',
      'array',
      'boolean',
      'date',
      'number',
      'decimal',
      'regexp'
      // 'string' registered separately, below
    ]

    const errorMessage = (type) => (key) => `${key} {${type}} is invalid`

    types.forEach((type) => {
      registerType(type, ({ key, value }) => {
        return is[type](value)
          ? { err: null, value }
          : { err: new Error(errorMessage(type)(key)), value: null }
      })
    })

    registerType('string', ({ key, value }) => {
      return is.string(value)
        ? { err: null, value: value.trim() }
        : { err: new Error(errorMessage('string')(key)), value: null }
    })

    registerType('any', ({ key, value }) => {
      return is.not.nullOrUndefined(value)
        ? { err: null, value: value }
        : { err: new Error(errorMessage('any')(key)), value: null }
    })
  }
}

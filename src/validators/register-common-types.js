module.exports = {
  name: 'registerCommonTypes',
  factory: (is, Blueprint) => {
    'use strict'

    const { registerType } = Blueprint
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

    const errorMessage = (type) => (key, value) => `expected \`${key}\` {${is.getType(value)}} to be {${type}}`

    types.forEach((type) => {
      registerType(type, ({ key, value }) => {
        return is[type](value)
          ? { err: null, value }
          : { err: new Error(errorMessage(type)(key, value)), value: null }
      })
    })

    registerType('string', ({ key, value }) => {
      return is.string(value)
        ? { err: null, value: value.trim() }
        : { err: new Error(errorMessage('string')(key, value)), value: null }
    })

    registerType('any', ({ key, value }) => {
      return is.not.nullOrUndefined(value)
        ? { err: null, value: value }
        : { err: new Error(errorMessage('any')(key, value)), value: null }
    })
  }
}

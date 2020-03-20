module.exports = {
  name: 'registerCommonTypes',
  factory: (is, Blueprint) => {
    'use strict'

    const { registerType } = Blueprint
    const types = [
      'function',
      'asyncFunction',
      'promise',
      'object',
      'array',
      'boolean',
      'date',
      'number',
      'decimal',
      'regexp',
      'primitive',
      // 'string' registered separately, below
    ]

    const errorMessage = (type) => (key, value) => `expected \`${key}\` {${is.getType(value)}} to be {${type}}`

    types.forEach((type) => {
      registerType(type, ({ key, value }) => {
        return is[type](value)
          ? { err: null, value }
          : { err: new Error(errorMessage(type)(key, value)) }
      })
    })

    registerType('string', ({ key, value }) => {
      if (is.string(value)) {
        const trimmed = value.trim()

        if (trimmed.length) {
          return { value: trimmed }
        }

        return { err: new Error(`expected \`${key}\` {${is.getType(value)}} to not be an empty string`) }
      } else {
        return { err: new Error(errorMessage('string')(key, value)) }
      }
    })

    registerType('any', ({ key, value }) => {
      return is.not.nullOrUndefined(value)
        ? { err: null, value: value }
        : { err: new Error(errorMessage('any')(key, value)) }
    })
  },
}

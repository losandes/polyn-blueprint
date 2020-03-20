module.exports = {
  name: 'registerExpressions',
  factory: (Blueprint) => {
    'use strict'

    const { registerValidator } = Blueprint

    registerValidator('expression', (regex) => ({ key, value }) => {
      return regex.test(value) === true
        ? { value: value }
        : { err: new Error(`expected \`${key}\` to match ${regex.toString()}`) }
    })
  },
}

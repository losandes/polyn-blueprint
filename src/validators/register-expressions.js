module.exports = {
  name: 'registerExpressions',
  factory: ({ registerValidator }) => {
    registerValidator('expression', (regex) => ({ key, value }) => {
      return regex.test(value) === true
        ? { err: null, value: value }
        : { err: new Error(`${key} does not match ${regex.toString()}`), value: null }
    })
  }
}

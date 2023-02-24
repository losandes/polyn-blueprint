const is = require('./src/is').factory()
const blueprint = require('./src/blueprint').factory(is)
const numberValidators = require('./src/validators/numbers').factory(is)

require('./src/validators/register-common-types.js').factory(is, blueprint)
require('./src/validators/register-decimals.js').factory(is, blueprint)
require('./src/validators/register-expressions.js').factory(blueprint)

// backward compatibility - can be removed in v3
Object.keys(numberValidators.__optional).forEach((key) => {
  blueprint.optional[key] = numberValidators.__optional[key]
})

delete numberValidators.__optional

module.exports = Object.freeze({
  ...{ is },
  ...numberValidators,
  ...blueprint,
})

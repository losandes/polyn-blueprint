const is = require('./src/is').factory()
const blueprint = require('./src/blueprint').factory(is)
const numberValidators = require('./src/validators/numbers').factory()

require('./src/validators/register-common-types.js').factory(is, blueprint)
require('./src/validators/register-decimals.js').factory(is, blueprint)
require('./src/validators/register-expressions.js').factory(blueprint)

module.exports = Object.freeze({
  ...{ is },
  ...numberValidators,
  ...blueprint
})

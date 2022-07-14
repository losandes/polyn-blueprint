const is = require('./src/is')()

const { InvalidValueError } = require('./src/validators/InvalidValueError.js')()
const { optional } = require('./src/validators/optional.js')({ is })
const { gt } = require('./src/validators/gt.js')({ is, InvalidValueError })
const { gte } = require('./src/validators/gte.js')({ is, InvalidValueError })
const { lt } = require('./src/validators/lt.js')({ is, InvalidValueError })
const { lte } = require('./src/validators/lte.js')({ is, InvalidValueError })
const { range } = require('./src/validators/range.js')({ is, gt, gte, lt, lte })

// const blueprint = require('./src/blueprint').factory(is)
// const numberValidators = require('./src/validators/numbers').factory(is)

// require('./src/validators/register-common-types.js').factory(is, blueprint)
// require('./src/validators/register-decimals.js').factory(is, blueprint)
// require('./src/validators/register-expressions.js').factory(blueprint)

// // backward compatibility - can be removed in v3
// Object.keys(numberValidators.__optional).forEach((key) => {
//   blueprint.optional[key] = numberValidators.__optional[key]
// })

// delete numberValidators.__optional

module.exports = Object.freeze({
  ...{ is, gt, gte, lt, lte, range },
  // ...numberValidators,
  // ...blueprint,
})

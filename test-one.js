// const { expect } = require('chai')
// const test = require('supposed')
// const { blueprint, optional, gt } = require('.')

// test('isValid Depth', () => {
//   const bp = blueprint('sut', {
//     optionalString: optional(gt(10)).withDefault(42)
//   })
//   const actual = bp.validate({})

//   expect(actual.err).to.be.null
//   expect(actual.value).to.deep.equal({
//     optionalString: 42
//   })
// })

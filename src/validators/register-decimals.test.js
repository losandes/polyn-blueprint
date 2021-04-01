module.exports = (test, dependencies) => {
  const { blueprint } = dependencies.sut

  return test('given `blueprint (decimals)`', {
    'it should support `decimal`, and `decimal?` to 15 places': {
      'and it should pass when the values are valid': (expect) => {
        const expected = {}
        const bp = {}

        for (let i = 1; i <= 15; i += 1) {
          expected[`decimal${i}`] = parseFloat(42.111111111111111.toFixed(i)) // eslint-disable-line no-loss-of-precision
          expected[`optionalDecimal${i}`] = null
          bp[`decimal${i}`] = `decimal:${i}`
          bp[`optionalDecimal${i}`] = `decimal:${i}?`
        }

        const actual = blueprint('sut', bp).validate(expected)

        expect(actual.err).to.be.null
        expect(actual.value).to.deep.equal(expected)
      },
      'and it should return an error when the values are not valid': (expect) => {
        const invalids = {
          requiredDecimal1: null,
          requiredDecimalWithPlaces1: null,
          requiredDecimal2: undefined,
          requiredDecimalWithPlaces2: undefined,
          requiredDecimal3: 'string',
          requiredDecimalWithPlaces3: 'string',
        }
        const bp = {
          requiredDecimal1: 'decimal',
          requiredDecimalWithPlaces1: 'decimal:2',
          requiredDecimal2: 'decimal',
          requiredDecimalWithPlaces2: 'decimal:2',
          requiredDecimal3: 'decimal',
          requiredDecimalWithPlaces3: 'decimal:2',
        }
        const messages = []

        for (let i = 1; i < 15; i += 1) {
          invalids[`decimal${i}`] = parseFloat(42.111111111111111.toFixed(i + 1)) // eslint-disable-line no-loss-of-precision
          invalids[`optionalDecimal${i}`] = parseFloat(42.111111111111111.toFixed(i + 1)) // eslint-disable-line no-loss-of-precision
          bp[`decimal${i}`] = `decimal:${i}`
          bp[`optionalDecimal${i}`] = `decimal:${i}?`
          messages.push(`expected \`decimal${i}\` to be a {decimal} with ${i} places`)
        }

        const actual = blueprint('sut', bp).validate(invalids)

        expect(actual.err).to.not.be.null
        messages.forEach((message) => {
          expect(actual.err.message.includes(message), message)
            .to.equal(true)
        })
        expect(actual.value).to.be.null
      },
    },
  })
}

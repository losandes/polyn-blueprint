module.exports = (test, dependencies) => {
  const { blueprint } = dependencies.sut

  return test('given `blueprint (decimals)`', {
    'it should support `decimal`, and `decimal?` to 15 places': (expect) => {
      const expected = {}
      const bp = {}

      for (let i = 1; i <= 15; i += 1) {
        expected[`decimal${i}`] = parseFloat(42.111111111111111.toFixed(i))
        expected[`optionalDecimal${i}`] = null
        bp[`decimal${i}`] = `decimal:${i}`
        bp[`optionalDecimal${i}`] = `decimal:${i}?`
      }

      const actual = blueprint('sut', bp).validate(expected)

      expect(actual.err).to.be.null
      expect(actual.value).to.deep.equal(expected)
    }
  })
}

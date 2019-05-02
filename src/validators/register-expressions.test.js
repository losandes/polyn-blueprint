module.exports = (test) => {
  const { blueprint } = test.sut

  return test('given `blueprint (expressions)`', {
    'it should support regular expressions': (expect) => {
      const expected = {
        type: 'book'
      }
      const actual = blueprint('sut', {
        type: /^book$/i
      }).validate(expected)
      const actualInvalid = blueprint('sut', {
        type: /^book$/i
      }).validate({
        type: 'person'
      })

      expect(actual.err).to.be.null
      expect(actual.value).to.deep.equal(expected)
      expect(actualInvalid.err).to.not.be.null
      expect(actualInvalid.err.message).to.equal('Invalid sut: sut.type does not match /^book$/i')
    }
  })
}

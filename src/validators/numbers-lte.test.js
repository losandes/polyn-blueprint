module.exports = (test) => {
  const { blueprint, lte } = test.sut

  const lte20Bp = blueprint('sut', {
    lte20: lte(20)
  })

  return test('given `lte`', {
    'when given a value greater than the minimum, it should return an error': (expect) => {
      expect(lte20Bp.validate({ lte20: 21 }).err).to.not.be.null
      expect(lte20Bp.validate({ lte20: 21 }).err.message)
        .to.equal('Invalid sut: sut.lte20 must be less than, or equal to 20')
    },
    'when given a value equal to the minimum': {
      when: () => lte20Bp.validate({ lte20: 20 }),
      'it should NOT return an error': (expect) => (err, actual) => {
        expect(err).to.be.null
        expect(actual.err).to.be.null
      },
      'it should return the value': (expect) => (err, actual) => {
        expect(err).to.be.null
        expect(actual.value.lte20).to.equal(20)
      }
    },
    'when given a value less than the minimum': {
      when: () => lte20Bp.validate({ lte20: 19 }),
      'it should NOT return an error': (expect) => (err, actual) => {
        expect(err).to.be.null
        expect(actual.err).to.be.null
      },
      'it should return the value': (expect) => (err, actual) => {
        expect(err).to.be.null
        expect(actual.value.lte20).to.equal(19)
      }
    }
  })
}

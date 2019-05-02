module.exports = (test) => {
  const { blueprint, gte } = test.sut

  const gte20Bp = blueprint('sut', {
    gte20: gte(20)
  })

  return test('given `gte`', {
    'when given a value less than the minimum, it should return an error': (expect) => {
      expect(gte20Bp.validate({ gte20: 19 }).err).to.not.be.null
      expect(gte20Bp.validate({ gte20: 19 }).err.message)
        .to.equal('Invalid sut: sut.gte20 must be greater than, or equal to 20')
    },
    'when given a value equal to the minimum, it should return an error': {
      when: () => gte20Bp.validate({ gte20: 20 }),
      'it should NOT return an error': (expect) => (err, actual) => {
        expect(err).to.be.null
        expect(actual.err).to.be.null
      },
      'it should return the value': (expect) => (err, actual) => {
        expect(err).to.be.null
        expect(actual.value.gte20).to.equal(20)
      }
    },
    'when given a value greater than the minimum': {
      when: () => gte20Bp.validate({ gte20: 21 }),
      'it should NOT return an error': (expect) => (err, actual) => {
        expect(err).to.be.null
        expect(actual.err).to.be.null
      },
      'it should return the value': (expect) => (err, actual) => {
        expect(err).to.be.null
        expect(actual.value.gte20).to.equal(21)
      }
    }
  })
}

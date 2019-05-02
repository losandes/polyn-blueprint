module.exports = (test) => {
  const { blueprint, gt } = test.sut

  const gt20Bp = blueprint('sut', {
    gt20: gt(20)
  })

  return test('given `gt`', {
    'when given a value less than the minimum, it should return an error': (expect) => {
      expect(gt20Bp.validate({ gt20: 19 }).err).to.not.be.null
      expect(gt20Bp.validate({ gt20: 19 }).err.message)
        .to.equal('Invalid sut: sut.gt20 must be greater than 20')
    },
    'when given a value equal to the minimum, it should return an error': (expect) => {
      expect(gt20Bp.validate({ gt20: 20 }).err).to.not.be.null
      expect(gt20Bp.validate({ gt20: 20 }).err.message)
        .to.equal('Invalid sut: sut.gt20 must be greater than 20')
    },
    'when given a value greater than the minimum': {
      when: () => gt20Bp.validate({ gt20: 21 }),
      'it should NOT return an error': (expect) => (err, actual) => {
        expect(err).to.be.null
        expect(actual.err).to.be.null
      },
      'it should return the value': (expect) => (err, actual) => {
        expect(err).to.be.null
        expect(actual.value.gt20).to.equal(21)
      }
    }
  })
}

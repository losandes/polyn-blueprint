module.exports = (test) => {
  const { blueprint, lt } = test.sut

  const lt20Bp = blueprint('sut', {
    lt20: lt(20)
  })

  return test('given `lt`', {
    'when given a value greater than the minimum, it should return an error': (expect) => {
      expect(lt20Bp.validate({ lt20: 21 }).err).to.not.be.null
      expect(lt20Bp.validate({ lt20: 21 }).err.message)
        .to.equal('Invalid sut: sut.lt20 must be less than 20')
    },
    'when given a value equal to the minimum, it should return an error': (expect) => {
      expect(lt20Bp.validate({ lt20: 20 }).err).to.not.be.null
      expect(lt20Bp.validate({ lt20: 20 }).err.message)
        .to.equal('Invalid sut: sut.lt20 must be less than 20')
    },
    'when given a value less than the minimum': {
      when: () => lt20Bp.validate({ lt20: 19 }),
      'it should NOT return an error': (expect) => (err, actual) => {
        expect(err).to.be.null
        expect(actual.err).to.be.null
      },
      'it should return the value': (expect) => (err, actual) => {
        expect(err).to.be.null
        expect(actual.value.lt20).to.equal(19)
      }
    }
  })
}

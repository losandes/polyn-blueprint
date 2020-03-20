module.exports = (test, dependencies) => {
  const { blueprint, lte, optional } = dependencies.sut

  const lte20Bp = blueprint('sut', {
    lte20: lte(20),
  })

  const expectValue = (expected, actual) => (expect) => {
    expect(actual.err).to.be.null
    expect(actual.value).to.deep.equal(expected)
  }

  const expectError = (actual) => (expect) => {
    expect(actual.err).to.not.be.null
    expect(actual.err.message)
      .to.equal('Invalid sut: expected `lte20` to be less than, or equal to 20')
  }

  const expectToThrow = (actual) => (expect) => {
    expect(actual).to.throw(Error, 'lte requires a maximum number to compare values to')
  }

  return test('given `lte`', {
    'when defined (`lte(20)`)': {
      'it should throw if the maximum is undefined':
        expectToThrow(() => { blueprint('sut', { lte20: lte() }) }),
      'it should throw if the maximum is null':
        expectToThrow(() => { blueprint('sut', { lte20: lte(null) }) }),
      'it should throw if the maximum is NaN':
        expectToThrow(() => { blueprint('sut', { lte20: lte('string') }) }),
    },
    'when `blueprint.validate` is called': {
      'it should return a value if the value is less than the maximum':
        expectValue({ lte20: 19 }, lte20Bp.validate({ lte20: 19 })),
      'it should return a value if the value is equal to the maximum':
      expectValue({ lte20: 20 }, lte20Bp.validate({ lte20: 20 })),
      'it should return an error if the value is less than the maximum':
        expectError(lte20Bp.validate({ lte20: 21 })),
      'it should return an error if the value is undefined':
        expectError(lte20Bp.validate({ lte20: undefined })),
      'it should return an error if the value is null':
        expectError(lte20Bp.validate({ lte20: null })),
      'it should return an error if the value is NaN':
        expectError(lte20Bp.validate({ lte20: 'string' })),
      'it should return an error if the value is not strictly a number':
        expectError(lte20Bp.validate({ lte20: '19' })),
    },
    'when the `optional` prefix is used, it should allow null and undefined': (expect) => {
      const lte20Bp = blueprint('sut', {
        lte20: lte(20),
        maybeLte20: optional.lte(20),
      })
      expect(lte20Bp.validate({ lte20: 19 }).err).to.be.null
      expect(lte20Bp.validate({ lte20: 19 }).value.maybeLte20).to.be.undefined
      expect(lte20Bp.validate({ lte20: 19, maybeLte20: null }).value.maybeLte20).to.be.null
      expect(lte20Bp.validate({ lte20: 19, maybeLte20: 20 }).value.maybeLte20).to.equal(20)
    },
    'when the `optional.withDefault` prefix is used, it should use the default when appropriate': (expect) => {
      const lte20Bp = blueprint('sut', {
        lte20: lte(20),
        maybeLte20: optional(lte(20)).withDefault(12),
      })
      expect(lte20Bp.validate({ lte20: 19 }).err).to.be.null
      expect(lte20Bp.validate({ lte20: 19 }).value.maybeLte20).to.equal(12)
      expect(lte20Bp.validate({ lte20: 19, maybeLte20: null }).value.maybeLte20).to.equal(12)
      expect(lte20Bp.validate({ lte20: 19, maybeLte20: 20 }).value.maybeLte20).to.equal(20)
    },
  })
}

module.exports = (test, dependencies) => {
  const { blueprint, gte, optional } = dependencies.sut

  const gte20Bp = blueprint('sut', {
    gte20: gte(20)
  })

  const expectValue = (expected, actual) => (expect) => {
    expect(actual.err).to.be.null
    expect(actual.value).to.deep.equal(expected)
  }

  const expectError = (actual) => (expect) => {
    expect(actual.err).to.not.be.null
    expect(actual.err.message)
      .to.equal('Invalid sut: expected `gte20` to be greater than, or equal to 20')
  }

  const expectToThrow = (actual) => (expect) => {
    expect(actual).to.throw(Error, 'gte requires a minimum number to compare values to')
  }

  return test('given `gte`', {
    'when defined (`gte(20)`)': {
      'it should throw if the minimum is undefined':
        expectToThrow(() => { blueprint('sut', { gte20: gte() }) }),
      'it should throw if the minimum is null':
        expectToThrow(() => { blueprint('sut', { gte20: gte(null) }) }),
      'it should throw if the minimum is NaN':
        expectToThrow(() => { blueprint('sut', { gte20: gte('string') }) })
    },
    'when `blueprint.validate` is called': {
      'it should return a value if the value is greater than the minimum':
        expectValue({ gte20: 21 }, gte20Bp.validate({ gte20: 21 })),
      'it should return a value if the value is equal to the minimum':
        expectValue({ gte20: 20 }, gte20Bp.validate({ gte20: 20 })),
      'it should return an error if the value is less than the minimum':
        expectError(gte20Bp.validate({ gte20: 19 })),
      'it should return an error if the value is undefined':
        expectError(gte20Bp.validate({ gte20: undefined })),
      'it should return an error if the value is null':
        expectError(gte20Bp.validate({ gte20: null })),
      'it should return an error if the value is NaN':
        expectError(gte20Bp.validate({ gte20: 'string' })),
      'it should return an error if the value is not strictly a number':
        expectError(gte20Bp.validate({ gte20: '21' }))
    },
    'when the `optional` prefix is used, it should allow null and undefined': (expect) => {
      const gte20Bp = blueprint('sut', {
        gte20: gte(20),
        maybeGte20: optional.gte(20)
      })
      expect(gte20Bp.validate({ gte20: 21 }).err).to.be.null
      expect(gte20Bp.validate({ gte20: 21 }).value.maybeGte20).to.be.undefined
      expect(gte20Bp.validate({ gte20: 21, maybeGte20: null }).value.maybeGte20).to.be.null
      expect(gte20Bp.validate({ gte20: 21, maybeGte20: 20 }).value.maybeGte20).to.equal(20)
    },
    'when the `optional.withDefault` prefix is used, it should use the default when appropriate': (expect) => {
      const gte20Bp = blueprint('sut', {
        gte20: gte(20),
        maybeGte20: optional(gte(20)).withDefault(42)
      })
      expect(gte20Bp.validate({ gte20: 21 }).err).to.be.null
      expect(gte20Bp.validate({ gte20: 21 }).value.maybeGte20).to.equal(42)
      expect(gte20Bp.validate({ gte20: 21, maybeGte20: null }).value.maybeGte20).to.equal(42)
      expect(gte20Bp.validate({ gte20: 21, maybeGte20: 20 }).value.maybeGte20).to.equal(20)
    }
  })
}

module.exports = (test, dependencies) => {
  const { blueprint, gt, optional } = dependencies.sut

  const gt20Bp = blueprint('sut', {
    gt20: gt(20)
  })

  const expectValue = (expected, actual) => (expect) => {
    expect(actual.err).to.be.null
    expect(actual.value).to.deep.equal(expected)
  }

  const expectError = (actual) => (expect) => {
    expect(actual.err).to.not.be.null
    expect(actual.err.message)
      .to.equal('Invalid sut: expected `gt20` to be greater than 20')
  }

  const expectToThrow = (actual) => (expect) => {
    expect(actual).to.throw(Error, 'gt requires a minimum number to compare values to')
  }

  return test('given `gt`', {
    'when defined (`gt(20)`)': {
      'it should throw if the minimum is undefined':
        expectToThrow(() => { blueprint('sut', { gt20: gt() }) }),
      'it should throw if the minimum is null':
        expectToThrow(() => { blueprint('sut', { gt20: gt(null) }) }),
      'it should throw if the minimum is NaN':
        expectToThrow(() => { blueprint('sut', { gt20: gt('string') }) })
    },
    'when `blueprint.validate` is called': {
      'it should return a value if the value is greater than the minimum':
        expectValue({ gt20: 21 }, gt20Bp.validate({ gt20: 21 })),
      'it should return an error if the value is equal to the minimum':
        expectError(gt20Bp.validate({ gt20: 20 })),
      'it should return an error if the value is less than the minimum':
        expectError(gt20Bp.validate({ gt20: 19 })),
      'it should return an error if the value is undefined':
        expectError(gt20Bp.validate({ gt20: undefined })),
      'it should return an error if the value is null':
        expectError(gt20Bp.validate({ gt20: null })),
      'it should return an error if the value is NaN':
        expectError(gt20Bp.validate({ gt20: 'string' })),
      'it should return an error if the value is not strictly a number':
        expectError(gt20Bp.validate({ gt20: '21' }))
    },
    'when the `optional` prefix is used, it should allow null and undefined': (expect) => {
      const gt20Bp = blueprint('sut', {
        gt20: gt(20),
        maybeGt20: optional.gt(20)
      })
      expect(gt20Bp.validate({ gt20: 21 }).err).to.be.null
      expect(gt20Bp.validate({ gt20: 21 }).value.maybeGt20).to.be.undefined
      expect(gt20Bp.validate({ gt20: 21, maybeGt20: null }).value.maybeGt20).to.be.null
    },
    'when the `optional.withDefault` prefix is used, it should use the default when appropriate': (expect) => {
      const gt20Bp = blueprint('sut', {
        gt20: gt(20),
        maybeGt20: optional(gt(20)).withDefault(42)
      })
      expect(gt20Bp.validate({ gt20: 21 }).err).to.be.null
      expect(gt20Bp.validate({ gt20: 21 }).value.maybeGt20).to.equal(42)
      expect(gt20Bp.validate({ gt20: 21, maybeGt20: null }).value.maybeGt20).to.equal(42)
    }
  })
}

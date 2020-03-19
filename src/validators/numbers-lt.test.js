module.exports = (test, dependencies) => {
  const { blueprint, lt, optional } = dependencies.sut

  const lt20Bp = blueprint('sut', {
    lt20: lt(20)
  })

  const expectValue = (expected, actual) => (expect) => {
    expect(actual.err).to.be.null
    expect(actual.value).to.deep.equal(expected)
  }

  const expectError = (actual) => (expect) => {
    expect(actual.err).to.not.be.null
    expect(actual.err.message)
      .to.equal('Invalid sut: expected `lt20` to be less than 20')
  }

  const expectToThrow = (actual) => (expect) => {
    expect(actual).to.throw(Error, 'lt requires a maximum number to compare values to')
  }

  return test('given `lt`', {
    'when defined (`lt(20)`)': {
      'it should throw if the maximum is undefined':
        expectToThrow(() => { blueprint('sut', { lt20: lt() }) }),
      'it should throw if the maximum is null':
        expectToThrow(() => { blueprint('sut', { lt20: lt(null) }) }),
      'it should throw if the maximum is NaN':
        expectToThrow(() => { blueprint('sut', { lt20: lt('string') }) })
    },
    'when `blueprint.validate` is called': {
      'it should return a value if the value is less than the maximum':
        expectValue({ lt20: 19 }, lt20Bp.validate({ lt20: 19 })),
      'it should return an error if the value is equal to the maximum':
        expectError(lt20Bp.validate({ lt20: 20 })),
      'it should return an error if the value is less than the maximum':
        expectError(lt20Bp.validate({ lt20: 21 })),
      'it should return an error if the value is undefined':
        expectError(lt20Bp.validate({ lt20: undefined })),
      'it should return an error if the value is null':
        expectError(lt20Bp.validate({ lt20: null })),
      'it should return an error if the value is NaN':
        expectError(lt20Bp.validate({ lt20: 'string' })),
      'it should return an error if the value is not strictly a number':
        expectError(lt20Bp.validate({ lt20: '19' }))
    },
    'when the `optional` prefix is used, it should allow null and undefined': (expect) => {
      const lt20Bp = blueprint('sut', {
        lt20: lt(20),
        maybeLt20: optional.lt(20)
      })
      expect(lt20Bp.validate({ lt20: 19 }).err).to.be.null
      expect(lt20Bp.validate({ lt20: 19 }).value.maybeLt20).to.be.undefined
      expect(lt20Bp.validate({ lt20: 19, maybeLt20: null }).value.maybeLt20).to.be.null
      expect(lt20Bp.validate({ lt20: 19, maybeLt20: 19 }).value.maybeLt20).to.equal(19)
    },
    'when the `optional.withDefault` prefix is used, it should use the default when appropriate': (expect) => {
      const lt20Bp = blueprint('sut', {
        lt20: lt(20),
        maybeLt20: optional(lt(20)).withDefault(12)
      })
      expect(lt20Bp.validate({ lt20: 19 }).err).to.be.null
      expect(lt20Bp.validate({ lt20: 19 }).value.maybeLt20).to.equal(12)
      expect(lt20Bp.validate({ lt20: 19, maybeLt20: null }).value.maybeLt20).to.equal(12)
      expect(lt20Bp.validate({ lt20: 19, maybeLt20: 19 }).value.maybeLt20).to.equal(19)
    }
  })
}

module.exports = (test, dependencies) => {
  const { gte } = dependencies.sut
  console.log(dependencies.sut)
  const expectToThrow = (expect) => (err) => {
    expect(err).to.not.be.null
    expect(err.message).to.equal('gte requires a minimum number to compare values to')
  }

  return test('given validators', {
    'when `gte` is called without a minimum': {
      when: () => gte(),
      'it should throw': expectToThrow,
    },
    'when `gte` is called with a `null` minimum': {
      when: () => gte(null),
      'it should throw': expectToThrow,
    },
    'when `gte` is called with a `NaN` minimum': {
      when: () => gte('string'),
      'it should throw': expectToThrow,
    },
    'when `gte` is called with a valid value': {
      given: () => [
        20, // equal to the minimum
        21, // greater than the minimum
      ],
      when: (values) => values.map((value) => ({
        value,
        actual: gte(20)({ key: 'key', value }),
      })),
      'it should return a value': (expect) => (err, actuals) => {
        expect(err).to.be.null
        actuals.forEach((result) => {
          expect(result.actual).to.deep.equal({ err: null, value: result.value })
        })
      },
    },
    'when `gte` is called with an invalid value': {
      given: () => [
        19,        // less than the minimum
        '21',      // not strictly a number
        undefined,
        null,
        'string',
      ],
      when: (values) => values.map((value) => gte(20)({ key: 'key', value })),
      'it should return an error': (expect) => (err, actuals) => {
        expect(err).to.be.null
        actuals.forEach((result) => {
          expect(result.err).to.not.be.null
          expect(result.err.name).to.equal('InvalidValueError')
        })
      },
    },
  })
}

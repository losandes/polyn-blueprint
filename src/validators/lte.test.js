module.exports = (test, dependencies) => {
  const { lte } = dependencies.sut

  const expectToThrow = (expect) => (err) => {
    expect(err).to.not.be.null
    expect(err.message).to.equal('lte requires a minimum number to compare values to')
  }

  return test('given validators', {
    'when `lte` is called without a minimum': {
      when: () => lte(),
      'it should throw': expectToThrow,
    },
    'when `lte` is called with a `null` minimum': {
      when: () => lte(null),
      'it should throw': expectToThrow,
    },
    'when `lte` is called with a `NaN` minimum': {
      when: () => lte('string'),
      'it should throw': expectToThrow,
    },
    'when `lte` is called with a valid value': {
      given: () => [
        19, // less than the minimum
        20, // equal to the minimum
      ],
      when: (values) => values.map((value) => ({
        value,
        actual: lte(20)({ key: 'key', value }),
      })),
      'it should return a value': (expect) => (err, actuals) => {
        expect(err).to.be.null
        actuals.forEach((result) => {
          expect(result.actual).to.deep.equal({ err: null, value: result.value })
        })
      },
    },
    'when `lte` is called with an invalid value': {
      given: () => [
        21,        // greater than the minimum
        '19',      // not strictly a number
        undefined,
        null,
        'string',
      ],
      when: (values) => values.map((value) => lte(20)({ key: 'key', value })),
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

module.exports = (test, dependencies) => {
  const { gt } = dependencies.sut

  const expectToThrow = (expect) => (err) => {
    expect(err).to.not.be.null
    expect(err.message).to.equal('gt requires a minimum number to compare values to')
  }

  return test('given validators', {
    'when `gt` is called without a minimum': {
      when: () => gt(),
      'it should throw': expectToThrow,
    },
    'when `gt` is called with a `null` minimum': {
      when: () => gt(null),
      'it should throw': expectToThrow,
    },
    'when `gt` is called with a `NaN` minimum': {
      when: () => gt('string'),
      'it should throw': expectToThrow,
    },
    'when `gt` is called with a valid value': {
      given: () => [
        21, // greater than the minimum
      ],
      when: (values) => values.map((value) => ({
        value,
        actual: gt(20)({ key: 'key', value }),
      })),
      'it should return a value': (expect) => (err, actuals) => {
        expect(err).to.be.null
        actuals.forEach((result) => {
          expect(result.actual).to.deep.equal({ err: null, value: result.value })
        })
      },
    },
    'when `gt` is called with an invalid value': {
      given: () => [
        19,        // less than the minimum
        20,        // equal to the minimum
        '21',      // not strictly a number
        undefined,
        null,
        'string',
      ],
      when: (values) => values.map((value) => gt(20)({ key: 'key', value })),
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

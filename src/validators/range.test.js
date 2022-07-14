module.exports = (test, dependencies) => {
  const { range } = dependencies.sut

  return test('given a `range`', {
    'with `lt`, and `gt`': {
      given: () => range({ gt: 10, lt: 20 }),
      'when the value is within the range': {
        when: (sut) => sut({ key: 'key', value: 15 }),
        'it should NOT return an error': (expect) => (err) => {
          expect(err).to.be.null
        },
        'it should return a value': (expect) => (err, actual) => {
          expect(err).to.be.null
          expect(actual.value).to.equal(15)
        },
      },
      'when the value is less than the range': {
        when: (sut) => sut({ key: 'key', value: 8 }),
        'it should return an error': (expect) => (err, actual) => {
          expect(err).to.be.null
          expect(actual.err).to.not.be.null
        },
      },
      'when the value is greater than the range': {
        when: (sut) => sut({ key: 'key', value: 21 }),
        'it should return an error': (expect) => (err, actual) => {
          expect(err).to.be.null
          expect(actual.err).to.not.be.null
        },
      },
      'when the value is equal to the lower end of the range': {
        when: (sut) => sut({ key: 'key', value: 10 }),
        'it should return an error': (expect) => (err, actual) => {
          expect(err).to.be.null
          expect(actual.err).to.not.be.null
        },
      },
      'when the value is equal to the upper end of the range': {
        when: (sut) => sut({ key: 'key', value: 20 }),
        'it should return an error': (expect) => (err, actual) => {
          expect(err).to.be.null
          expect(actual.err).to.not.be.null
        },
      },
    },
    'with `lte`, and `gt`': {
      given: () => range({ gt: 10, lte: 20 }),
      'when the value is within the range': {
        when: (sut) => sut({ key: 'key', value: 15 }),
        'it should NOT return an error': (expect) => (err) => {
          expect(err).to.be.null
        },
        'it should return a value': (expect) => (err, actual) => {
          expect(err).to.be.null
          expect(actual.value).to.equal(15)
        },
      },
      'when the value is less than the range': {
        when: (sut) => sut({ key: 'key', value: 8 }),
        'it should return an error': (expect) => (err, actual) => {
          expect(err).to.be.null
          expect(actual.err).to.not.be.null
        },
      },
      'when the value is greater than the range': {
        when: (sut) => sut({ key: 'key', value: 21 }),
        'it should return an error': (expect) => (err, actual) => {
          expect(err).to.be.null
          expect(actual.err).to.not.be.null
        },
      },
      'when the value is equal to the lower end of the range': {
        when: (sut) => sut({ key: 'key', value: 10 }),
        'it should return an error': (expect) => (err, actual) => {
          expect(err).to.be.null
          expect(actual.err).to.not.be.null
        },
      },
      'when the value is equal to the upper end of the range': {
        when: (sut) => sut({ key: 'key', value: 20 }),
        'it should NOT return an error': (expect) => (err) => {
          expect(err).to.be.null
        },
        'it should return a value': (expect) => (err, actual) => {
          expect(err).to.be.null
          expect(actual.value).to.equal(20)
        },
      },
    },
    'with `lt`, and `gte`': {
      given: () => range({ gte: 10, lt: 20 }),
      'when the value is within the range': {
        when: (sut) => sut({ key: 'key', value: 15 }),
        'it should NOT return an error': (expect) => (err) => {
          expect(err).to.be.null
        },
        'it should return a value': (expect) => (err, actual) => {
          expect(err).to.be.null
          expect(actual.value).to.equal(15)
        },
      },
      'when the value is less than the range': {
        when: (sut) => sut({ key: 'key', value: 8 }),
        'it should return an error': (expect) => (err, actual) => {
          expect(err).to.be.null
          expect(actual.err).to.not.be.null
        },
      },
      'when the value is greater than the range': {
        when: (sut) => sut({ key: 'key', value: 21 }),
        'it should return an error': (expect) => (err, actual) => {
          expect(err).to.be.null
          expect(actual.err).to.not.be.null
        },
      },
      'when the value is equal to the lower end of the range': {
        when: (sut) => sut({ key: 'key', value: 10 }),
        'it should NOT return an error': (expect) => (err) => {
          expect(err).to.be.null
        },
        'it should return a value': (expect) => (err, actual) => {
          expect(err).to.be.null
          expect(actual.value).to.equal(10)
        },
      },
      'when the value is equal to the upper end of the range': {
        when: (sut) => sut({ key: 'key', value: 20 }),
        'it should return an error': (expect) => (err, actual) => {
          expect(err).to.be.null
          expect(actual.err).to.not.be.null
        },
      },
    },
    'with `lte`, and `gte`': {
      given: () => range({ gte: 10, lte: 20 }),
      'when the value is within the range': {
        when: (sut) => sut({ key: 'key', value: 15 }),
        'it should NOT return an error': (expect) => (err) => {
          expect(err).to.be.null
        },
        'it should return a value': (expect) => (err, actual) => {
          expect(err).to.be.null
          expect(actual.value).to.equal(15)
        },
      },
      'when the value is less than the range': {
        when: (sut) => sut({ key: 'key', value: 8 }),
        'it should return an error': (expect) => (err, actual) => {
          expect(err).to.be.null
          expect(actual.err).to.not.be.null
        },
      },
      'when the value is greater than the range': {
        when: (sut) => sut({ key: 'key', value: 21 }),
        'it should return an error': (expect) => (err, actual) => {
          expect(err).to.be.null
          expect(actual.err).to.not.be.null
        },
      },
      'when the value is equal to the lower end of the range': {
        when: (sut) => sut({ key: 'key', value: 10 }),
        'it should NOT return an error': (expect) => (err) => {
          expect(err).to.be.null
        },
        'it should return a value': (expect) => (err, actual) => {
          expect(err).to.be.null
          expect(actual.value).to.equal(10)
        },
      },
      'when the value is equal to the upper end of the range': {
        when: (sut) => sut({ key: 'key', value: 20 }),
        'it should NOT return an error': (expect) => (err) => {
          expect(err).to.be.null
        },
        'it should return a value': (expect) => (err, actual) => {
          expect(err).to.be.null
          expect(actual.value).to.equal(20)
        },
      },
    },
    'missing options': {
      when: () => range(),
      'it should throw': (expect) => (err) => {
        expect(err).to.not.be.null
      },
    },
    'missing both `lt`, and `lte`': {
      when: () => range({ gt: 10 }),
      'it should throw': (expect) => (err) => {
        expect(err).to.not.be.null
      },
    },
    'missing both `gt`, and `gte`': {
      when: () => range({ lt: 10 }),
      'it should throw': (expect) => (err) => {
        expect(err).to.not.be.null
      },
    },
  })
}

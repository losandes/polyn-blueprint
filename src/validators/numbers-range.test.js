module.exports = (test) => {
  const { blueprint, range } = test.sut

  return test('given a `range`', {
    'with `lt`, and `gt`': {
      when: () => blueprint('sut', { actual: range({ gt: 10, lt: 20 }) }),
      'when the value is within the range': {
        'it should NOT return an error': (expect) => (err, bp) => {
          expect(err).to.be.null
          expect(bp.validate({ actual: 15 }).err).to.be.null
        },
        'it should return a value': (expect) => (err, bp) => {
          expect(err).to.be.null
          expect(bp.validate({ actual: 15 }).value.actual).to.equal(15)
        }
      },
      'when the value is less than the range': {
        'it should return an error': (expect) => (err, bp) => {
          expect(err).to.be.null
          expect(bp.validate({ actual: 8 }).err).to.not.be.null
        }
      },
      'when the value is greater than the range': {
        'it should return an error': (expect) => (err, bp) => {
          expect(err).to.be.null
          expect(bp.validate({ actual: 21 }).err).to.not.be.null
        }
      },
      'when the value is equal to the lower end of the range': {
        'it should return an error': (expect) => (err, bp) => {
          expect(err).to.be.null
          expect(bp.validate({ actual: 10 }).err).to.not.be.null
        }
      },
      'when the value is equal to the upper end of the range': {
        'it should return an error': (expect) => (err, bp) => {
          expect(err).to.be.null
          expect(bp.validate({ actual: 20 }).err).to.not.be.null
        }
      }
    },
    'with `lte`, and `gt`': {
      when: () => blueprint('sut', { actual: range({ gt: 10, lte: 20 }) }),
      'when the value is within the range': {
        'it should NOT return an error': (expect) => (err, bp) => {
          expect(err).to.be.null
          expect(bp.validate({ actual: 15 }).err).to.be.null
        },
        'it should return a value': (expect) => (err, bp) => {
          expect(err).to.be.null
          expect(bp.validate({ actual: 15 }).value.actual).to.equal(15)
        }
      },
      'when the value is less than the range': {
        'it should return an error': (expect) => (err, bp) => {
          expect(err).to.be.null
          expect(bp.validate({ actual: 8 }).err).to.not.be.null
        }
      },
      'when the value is greater than the range': {
        'it should return an error': (expect) => (err, bp) => {
          expect(err).to.be.null
          expect(bp.validate({ actual: 21 }).err).to.not.be.null
        }
      },
      'when the value is equal to the lower end of the range': {
        'it should return an error': (expect) => (err, bp) => {
          expect(err).to.be.null
          expect(bp.validate({ actual: 10 }).err).to.not.be.null
        }
      },
      'when the value is equal to the upper end of the range': {
        'it should NOT return an error': (expect) => (err, bp) => {
          expect(err).to.be.null
          expect(bp.validate({ actual: 20 }).err).to.be.null
        },
        'it should return a value': (expect) => (err, bp) => {
          expect(err).to.be.null
          expect(bp.validate({ actual: 20 }).value.actual).to.equal(20)
        }
      }
    },
    'with `lt`, and `gte`': {
      when: () => blueprint('sut', { actual: range({ gte: 10, lt: 20 }) }),
      'when the value is within the range': {
        'it should NOT return an error': (expect) => (err, bp) => {
          expect(err).to.be.null
          expect(bp.validate({ actual: 15 }).err).to.be.null
        },
        'it should return a value': (expect) => (err, bp) => {
          expect(err).to.be.null
          expect(bp.validate({ actual: 15 }).value.actual).to.equal(15)
        }
      },
      'when the value is less than the range': {
        'it should return an error': (expect) => (err, bp) => {
          expect(err).to.be.null
          expect(bp.validate({ actual: 8 }).err).to.not.be.null
        }
      },
      'when the value is greater than the range': {
        'it should return an error': (expect) => (err, bp) => {
          expect(err).to.be.null
          expect(bp.validate({ actual: 21 }).err).to.not.be.null
        }
      },
      'when the value is equal to the lower end of the range': {
        'it should NOT return an error': (expect) => (err, bp) => {
          expect(err).to.be.null
          expect(bp.validate({ actual: 10 }).err).to.be.null
        },
        'it should return a value': (expect) => (err, bp) => {
          expect(err).to.be.null
          expect(bp.validate({ actual: 10 }).value.actual).to.equal(10)
        }
      },
      'when the value is equal to the upper end of the range': {
        'it should return an error': (expect) => (err, bp) => {
          expect(err).to.be.null
          expect(bp.validate({ actual: 20 }).err).to.not.be.null
        }
      }
    },
    'with `lte`, and `gte`': {
      when: () => blueprint('sut', { actual: range({ gte: 10, lte: 20 }) }),
      'when the value is within the range': {
        'it should NOT return an error': (expect) => (err, bp) => {
          expect(err).to.be.null
          expect(bp.validate({ actual: 15 }).err).to.be.null
        },
        'it should return a value': (expect) => (err, bp) => {
          expect(err).to.be.null
          expect(bp.validate({ actual: 15 }).value.actual).to.equal(15)
        }
      },
      'when the value is less than the range': {
        'it should return an error': (expect) => (err, bp) => {
          expect(err).to.be.null
          expect(bp.validate({ actual: 8 }).err).to.not.be.null
        }
      },
      'when the value is greater than the range': {
        'it should return an error': (expect) => (err, bp) => {
          expect(err).to.be.null
          expect(bp.validate({ actual: 21 }).err).to.not.be.null
        }
      },
      'when the value is equal to the lower end of the range': {
        'it should NOT return an error': (expect) => (err, bp) => {
          expect(err).to.be.null
          expect(bp.validate({ actual: 10 }).err).to.be.null
        },
        'it should return a value': (expect) => (err, bp) => {
          expect(err).to.be.null
          expect(bp.validate({ actual: 10 }).value.actual).to.equal(10)
        }
      },
      'when the value is equal to the upper end of the range': {
        'it should NOT return an error': (expect) => (err, bp) => {
          expect(err).to.be.null
          expect(bp.validate({ actual: 20 }).err).to.be.null
        },
        'it should return a value': (expect) => (err, bp) => {
          expect(err).to.be.null
          expect(bp.validate({ actual: 20 }).value.actual).to.equal(20)
        }
      }
    },
    'missing options': {
      when: () => blueprint('sut', { actual: range() }),
      'it should throw': (expect) => (err) => {
        expect(err).to.not.be.null
      }
    },
    'missing both `lt`, and `lte`': {
      when: () => blueprint('sut', { actual: range({ gt: 10 }) }),
      'it should throw': (expect) => (err) => {
        expect(err).to.not.be.null
      }
    },
    'missing both `gt`, and `gte`': {
      when: () => blueprint('sut', { actual: range({ lt: 10 }) }),
      'it should throw': (expect) => (err) => {
        expect(err).to.not.be.null
      }
    }
  })
}

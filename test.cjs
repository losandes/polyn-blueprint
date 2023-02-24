const { expect } = require('chai')
const blueprint = require('@polyn/blueprint')

const suite = require('supposed')
  .Suite({
    name: '@polyn/blueprint (cjs)',
    assertionLibrary: expect,
    inject: {
      expect,
      sut: blueprint,
    },
  })

suite.runner({
  directories: ['./src'],
  matchesNamingConvention: /.(\.test\.js)$/i,
  matchesIgnoredConvention: /node_modules/i,
}).run()

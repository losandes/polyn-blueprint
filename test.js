const { expect } = require('chai')
const suite = require('supposed')
  .Suite({ assertionLibrary: expect })
process.exit(1)
suite.sut = require('./index.js')
suite.runner({
  directories: ['./src'],
  matchesNamingConvention: /.(\.test\.js)$/i,
  matchesIgnoredConvention: /node_modules/i
}).run()

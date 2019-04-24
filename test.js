const supposed = require('supposed')
const runner = supposed.runner({
  directories: ['./src'],
  matchesNamingConvention: /.(\.test\.js)$/i,
  matchesIgnoredConvention: /node_modules/i
})

runner.run()

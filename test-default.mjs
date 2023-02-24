import { expect } from 'chai'
import supposed from 'supposed'
import blueprintpkg from '@polyn/blueprint'

const suite = supposed.Suite({
  name: 'test:mjs:default (mjs)',
  assertionLibrary: expect,
  inject: {
    expect,
    sut: blueprintpkg,
  },
})

suite.runner({
  directories: ['./src'],
  matchesNamingConvention: /.(\.test\.js)$/i,
  matchesIgnoredConvention: /node_modules/i,
}).run()

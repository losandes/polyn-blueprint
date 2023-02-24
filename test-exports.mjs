import { expect } from 'chai'
import supposed from 'supposed'
import {
  blueprint,
  registerValidator,
  registerType,
  registerBlueprint,
  registerExpression,
  gt,
  gte,
  lt,
  lte,
  range,
  optional,
  required,
  is,
  getValidators,
  getValidator,
} from '@polyn/blueprint'

const suite = supposed.Suite({
  name: 'test:mjs:exports (mjs)',
  assertionLibrary: expect,
  inject: {
    expect,
    sut: {
      blueprint,
      registerValidator,
      registerType,
      registerBlueprint,
      registerExpression,
      gt,
      gte,
      lt,
      lte,
      range,
      optional,
      required,
      is,
      getValidators,
      getValidator,
    },
  },
})

suite.runner({
  directories: ['./src'],
  matchesNamingConvention: /.(\.test\.js)$/i,
  matchesIgnoredConvention: /node_modules/i,
}).run()

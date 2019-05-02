// Node, or global
;(function (root) { // eslint-disable-line no-extra-semi
  'use strict'

  const module = { factories: {} }

  Object.defineProperty(module, 'exports', {
    get: function () {
      return null
    },
    set: function (val) {
      module.factories[val.name] = val.factory
    },
    // this property should show up when this object's property names are enumerated
    enumerable: true,
    // this property may not be deleted
    configurable: false
  })

  // MODULES_HERE

  const is = module.factories.is()
  const blueprint = Object.assign(
    { is },
    module.factories.numberValidators(),
    module.factories.blueprint(is)
  )

  root.polyn = root.polyn || {}
  root.polyn.blueprint = Object.freeze(blueprint)
  module.factories.registerCommonTypes(is, root.polyn.blueprint)
  module.factories.registerDecimals(is, root.polyn.blueprint)
  module.factories.registerExpressions(root.polyn.blueprint)

  // we don't need these anymore
  delete module.factories
}(window))

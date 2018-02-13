'use strict'

module.exports = function (Paratii, registry, provider) {
  var module = {}
  let paratii = new Paratii({
    provider
  })

  // just for testing
  paratii.eth.setRegistryAddress(registry)
  module.videoObserver = require('./video')(paratii)
  module.userObserver = require('./user')(paratii)
  module.transactionObserver = require('./transaction')(paratii)

  return module
}

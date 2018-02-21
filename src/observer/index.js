'use strict'

module.exports = function (Paratii, registry, provider, testsparatii) {
  var module = {}
  let paratii
  if (testsparatii) {
    console.log('Paratii is setted externally ')
    paratii = testsparatii
  } else {
    paratii = new Paratii({
      provider
    })
  }

  // just for testing
  paratii.eth.setRegistryAddress(registry)
  module.videoObserver = require('./video')(paratii)
  module.userObserver = require('./user')(paratii)
  module.transactionObserver = require('./transaction')(paratii)

  return module
}

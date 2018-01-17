'use strict'

module.exports = function (Paratii, registry) {
  var module = {}
  let paratii = new Paratii({
    provider: 'http://localhost:8545'
  })
  // just for testing
  // paratii.setRegistry(registry)
  module.videoObserver = require('./video')(paratii)
  module.userObserver = require('./user')(paratii)

  return module
}

'use strict'

module.exports = function (Paratii) {
  var module = {}
  let paratii = new Paratii({
    provider: 'http://localhost:8545'
  })

  module.videoObserver = require('./video')(paratii)
  module.userObserver = require('./user')(paratii)

  return module
}

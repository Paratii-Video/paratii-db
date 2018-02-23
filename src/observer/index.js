'use strict'
const helper = require('../helper')

module.exports = function (Paratii, registry, provider, testlib) {
  var module = {}
  let paratii
  if (testlib) {
    helper.log('Paratii is setted externally ')
    paratii = testlib
  } else {
    paratii = new Paratii({
      provider
    })
  }

  paratii.ipfs.start((err) => {
    if (err) {
      console.log('ipfs start failed ', err)
    }
  })
  // just for testing
  paratii.eth.setRegistryAddress(registry)
  module.videoObserver = require('./video')(paratii)
  module.userObserver = require('./user')(paratii)
  module.transactionObserver = require('./transaction')(paratii)
  module.voucherObserver = require('./voucher')(paratii)

  return module
}

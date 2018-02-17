'use strict'

const Models = require('../models')
const parser = require('../parser')
const Transaction = Models.transaction

module.exports = function (paratii) {
  var module = {}
  // paratiiInstance = paratii

  module.init = async function () {
    // events hook

    await paratii.eth.events.addListener('TransferPTI', function (log) {
      console.log('creating transactions PTI', log.transactionHash)

      Transaction.upsert(parser.tx(log), (err, user) => {
        if (err) {
          throw err
        }
      })
    })

    await paratii.eth.events.addListener('TransferETH', function (log) {
      console.log('creating transactions ETH', log.transactionHash)

      Transaction.upsert(parser.tx(log), (err, user) => {
        if (err) {
          throw err
        }
      })
    })

    console.log('inizialized all transaction events')
  }

  return module
}

'use strict'

const Models = require('../models')
const parser = require('../parser')
const Transaction = Models.transaction
const helper = require('../helper')

module.exports = function (paratii) {
  var module = {}
  // paratiiInstance = paratii

  module.init = async function () {
    // events hook

    await paratii.eth.events.addListener('TransferPTI', function (log) {
      helper.logEvents(log, '⛵  TransferPTI Event at Transactions contracts events')

      Transaction.upsert(parser.tx(log), (err, user) => {
        if (err) {
          throw err
        }
      })
    })

    await paratii.eth.events.addListener('TransferETH', function (log) {
      helper.logEvents(log, '⛵  TransferETH Event at Transactions contracts events')
      Transaction.upsert(parser.tx(log), (err, user) => {
        if (err) {
          throw err
        }
      })
    })

    helper.log('|      👓  observing at ⛵ Transactions contracts events')
  }

  return module
}

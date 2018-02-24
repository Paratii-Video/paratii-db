'use strict'

const Models = require('../models')
const parser = require('../parser')
const Transaction = Models.transaction
const helper = require('../helper')

module.exports = function (paratii) {
  var module = {}

  module.init = async function () {
    // events hook

    /**
     * Observer and upserter for new PTI transfer
     * @param  {String} log the transfer event
     */
    await paratii.eth.events.addListener('TransferPTI', function (log) {
      helper.logEvents(log, '⛵  TransferPTI Event at Transactions contracts events')

      Transaction.upsert(parser.tx(log), (err, user) => {
        if (err) {
          throw err
        }
      })
    })

    /**
     * Observer and upserter for new ETH transfer
     * @param  {String} log the transfer event
     */
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

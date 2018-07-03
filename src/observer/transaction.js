'use strict'

const Models = require('../models')
const parser = require('../parser')
const Transaction = Models.transaction
const helper = require('../helper')

module.exports = function (paratii) {
  var module = {}

  module.init = async function (options) {
    // events hook

    /**
     * Observer and upserter for new PTI transfer
     * @param  {String} log the transfer event
     */
    await paratii.eth.events.addListener('TransferPTI', options, function (log) {
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
    await paratii.eth.events.addListener('TransferETH', options, function (log) {
      helper.logEvents(log, '⛵  TransferETH Event at Transactions contracts events')
      Transaction.upsert(parser.tx(log), (err, user) => {
        if (err) {
          throw err
        }
      })
    })

    if (options.fromBlock !== undefined) {
      helper.log('    👓  syncing ⛵ Transactions contract events since the block ' + options.fromBlock)
    } else {
      helper.log('    👓  observing at ⛵ Transactions contract events')
    }
  }

  return module
}

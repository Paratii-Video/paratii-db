'use strict'

const Models = require('../models')
const parser = require('../parser')
const Voucher = Models.voucher
const helper = require('../helper')

module.exports = function (paratii) {
  var module = {}
  // paratiiInstance = paratii

  module.init = async function (options) {
    // events hook

    /**
     * Observer and upserter for created voucher event
     * @param  {String} log the CreateVoucher event
     */
    await paratii.eth.events.addListener('CreateVoucher', options, function (log) {
      helper.logEvents(log, '🎫  CreateVoucher Event at Vouchers contract events')

      Voucher.upsert(parser.voucher(log), (err, user) => {
        if (err) {
          throw err
        }
      })
    })

    /**
     * Observer and upserter for redeemed voucher event
     * @param  {String} log the RedeemVoucher event
     */
    await paratii.eth.events.addListener('RedeemVoucher', options, function (log) {
      helper.logEvents(log, '🎫  RedeemVoucher Event at Vouchers contract events')
      Voucher.upsert(parser.voucher(log), (err, user) => {
        if (err) {
          throw err
        }
      })
    })

    if (options.fromBlock !== undefined) {
      helper.log('|      👓  syncing 🎫 Vouchers contract events since the block ' + options.fromBlock)
    } else {
      helper.log('|      👓  observing at 🎫 Vouchers contract events')
    }
  }

  return module
}

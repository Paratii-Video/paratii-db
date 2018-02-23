'use strict'

const Models = require('../models')
const parser = require('../parser')
const Voucher = Models.voucher
const helper = require('../helper')

module.exports = function (paratii) {
  var module = {}
  // paratiiInstance = paratii

  module.init = async function () {
    // events hook

    await paratii.eth.events.addListener('CreateVoucher', function (log) {
      helper.logEvents(log, '🎫  CreateVoucher Event at Vouchers contract events')

      Voucher.upsert(parser.voucher(log), (err, user) => {
        if (err) {
          throw err
        }
      })
    })

    await paratii.eth.events.addListener('RedeemVoucher', function (log) {
      helper.logEvents(log, '🎫  RedeemVoucher Event at Vouchers contract events')
      Voucher.upsert(parser.voucher(log), (err, user) => {
        if (err) {
          throw err
        }
      })
    })

    helper.log('|      👓  observing at 🎫 Vouchers contract events')
  }

  return module
}

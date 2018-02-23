'use strict'

const Models = require('../models')
const parser = require('../parser')
const Voucher = Models.voucher

module.exports = function (paratii) {
  var module = {}
  // paratiiInstance = paratii

  module.init = async function () {
    // events hook

    await paratii.eth.events.addListener('CreateVoucher', function (log) {
      console.log('|      🎫  CreateVoucher Event at Vouchers contract events')
      console.log('|          ####### here the log: #######              ')
      console.log('|                                                     ')
      console.log(log)
      console.log('|                                                     ')
      console.log('|          ####### end of the log #######             ')

      Voucher.upsert(parser.voucher(log), (err, user) => {
        if (err) {
          throw err
        }
      })
    })

    await paratii.eth.events.addListener('RedeemVoucher', function (log) {
      console.log('|      🎫  RedeemVoucher Event at Vouchers contract events')
      console.log('|          ####### here the log: #######              ')
      console.log('|                                                     ')
      console.log(log)
      console.log('|                                                     ')
      console.log('|          ####### end of the log #######             ')

      Voucher.upsert(parser.voucher(log), (err, user) => {
        if (err) {
          throw err
        }
      })
    })

    console.log('|      👓  observing at 🎫 Vouchers contract events')
  }

  return module
}

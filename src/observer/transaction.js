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
      console.log('|      ⛵  TransferPTI Event at Transactions contracts events')
      console.log('|          ####### here the log: #######              ')
      console.log('|                                                     ')
      console.log(log)
      console.log('|                                                     ')
      console.log('|          ####### end of the log #######             ')

      Transaction.upsert(parser.tx(log), (err, user) => {
        if (err) {
          throw err
        }
      })
    })

    await paratii.eth.events.addListener('TransferETH', function (log) {
      console.log('|      ⛵  TransferETH Event at Transactions contracts events')
      console.log('|          ####### here the log: #######              ')
      console.log('|                                                     ')
      console.log(log)
      console.log('|                                                     ')
      console.log('|          ####### end of the log #######             ')

      Transaction.upsert(parser.tx(log), (err, user) => {
        if (err) {
          throw err
        }
      })
    })

    console.log('|      👓  observing at Transactions contracts events')
  }

  return module
}

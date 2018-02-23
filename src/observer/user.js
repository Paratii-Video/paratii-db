'use strict'

const Models = require('../models')
const parser = require('../parser')
const User = Models.user
const helper = require('../helper')

module.exports = function (paratii) {
  var module = {}
  // paratiiInstance = paratii

  module.init = async function () {
    // events hook

    await paratii.eth.events.addListener('CreateUser', function (log) {
      helper.logEvents(log, '🙌  CreateUser Event at Users contract events')

      User.upsert(parser.user(log), (err, user) => {
        if (err) {
          throw err
        }
      })
    })
    await paratii.eth.events.addListener('RemoveUser', function (log) {
      helper.logEvents(log, '🙌  Removing Event at Users contract events')

      User.delete(log.returnValues._address, (err, res) => {
        if (err) {
          throw err
        }
      })
    })

    helper.log('|      👓  observing at 🙌 User contract events')
  }

  return module
}

'use strict'

const Models = require('../models')
const parser = require('../parser')
const User = Models.user
const helper = require('../helper')

module.exports = function (paratii) {
  var module = {}

  module.init = async function () {
    // events hook

    /**
     * Observer and upserter for created user event
     * @param  {String} log the CreateUser event
     */
    await paratii.eth.events.addListener('CreateUser', function (log) {
      helper.logEvents(log, '🙌  CreateUser Event at Users contract events')

      User.upsert(parser.user(log), (err, user) => {
        if (err) {
          throw err
        }
      })
    })

    /**
     * Observer and remover for removed user event
     * @param  {String} log the RemoveUser event
     */
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

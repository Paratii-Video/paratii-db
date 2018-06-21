'use strict'

const Models = require('../models')
const parser = require('../parser')
const User = Models.user
const Video = Models.video
const helper = require('../helper')

module.exports = function (paratii) {
  var module = {}

  module.init = async function (options) {
    // events hook
    /**
     * Observer and upserter for created user event
     * @param  {String} log the CreateUser event
     */

    const async = require('async')
    // manage queue for creating video
    const creatingUserQueue = async.queue((log, cb) => {
      User.upsert(parser.user(log), cb)
    }, 1)

    // manage queue for creating video
    const updatingUsernameQueue = async.queue((log, cb) => {
      Video.updateUsername(parser.user(log), cb)
    }, 1)

    await paratii.eth.events.addListener('CreateUser', options, function (log) {
      helper.logEvents(log, '🙌  CreateUser Event at Users contract events')

      creatingUserQueue.push(log)
      updatingUsernameQueue.push(log)
    })

    /**
     * Observer and remover for removed user event
     * @param  {String} log the RemoveUser event
     */
    await paratii.eth.events.addListener('RemoveUser', options, function (log) {
      helper.logEvents(log, '🙌  Removing Event at Users contract events')

      User.delete(log.returnValues._address, (err, res) => {
        if (err) {
          throw err
        }
      })
    })

    if (options.fromBlock !== undefined) {
      helper.log('    👓  syncing 🙌 User contract events since the block ' + options.fromBlock)
    } else {
      helper.log('    👓  observing at 🙌 User contract events')
    }
  }

  return module
}

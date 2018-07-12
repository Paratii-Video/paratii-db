'use strict'

const Models = require('../models')
const parser = require('../parser')
const Challenge = Models.challenge

const helper = require('../helper')

module.exports = function (paratii) {
  var module = {}

  module.init = async function (options) {
    // events hook

    /**
     * Observer and upserter for Challenge TCR  event
     * @param  {String} log the Challenge event
     */
    await paratii.eth.events.addListener('Challenge', options, function (log) {
      helper.logEvents(log, '🎭  Challenge Event at TCR contract events')
      // saving application
      Challenge.upsert(parser.challenge(log, paratii), (err, res) => {
        if (err) {
          throw err
        }
      })
    })

    if (options.fromBlock !== undefined) {
      helper.log('    👓  syncing 🎭 TCR contract challenge events since the block ' + options.fromBlock)
    } else {
      helper.log('    👓  observing at 🎭 TCR contract challenge events')
    }
  }

  return module
}

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

    /**
     * Observer and upserter for ChallengeFailed TCR  event
     * @param  {String} log the ChallengeFailed event
     */
    await paratii.eth.events.addListener('ChallengeFailed', options, function (log) {
      helper.logEvents(log, '🎭  Challenge Event at TCR contract events')
      // saving application result as failed
      Challenge.failed(parser.challenge(log, paratii), (err, res) => {
        if (err) {
          throw err
        }
      })
    })

    /**
     * Observer and upserter for ChallengeSucceeded TCR  event
     * @param  {String} log the ChallengeSucceeded event
     */
    await paratii.eth.events.addListener('ChallengeSucceeded', options, function (log) {
      helper.logEvents(log, '🎭  Challenge Event at TCR contract events')
      // saving application as succeeded
      Challenge.succeeded(parser.challenge(log, paratii), (err, res) => {
        if (err) {
          throw err
        }
      })
    })

    /**
     * Observer and upserter for PollCreated TCR event
     * @param  {String} log the PollCreated event
     */
    await paratii.eth.events.addListener('PollCreated', options, function (log) {
      helper.logEvents(log, '🎭  PollCreated Event at TCR contract events')
      // saving application
      Challenge.upsert(parser.poll(log, paratii), (err, res) => {
        if (err) {
          throw err
        }
      })
    })

    if (options.fromBlock !== undefined) {
      helper.log('    👓  syncing 🎭 TCR contract events since the block ' + options.fromBlock)
    } else {
      helper.log('    👓  observing at 🎭 TCR contract events')
    }
  }

  return module
}

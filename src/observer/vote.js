'use strict'

const Models = require('../models')
const parser = require('../parser')
const Vote = Models.vote

const helper = require('../helper')

module.exports = function (paratii) {
  var module = {}

  module.init = async function (options) {
    // events hook

    /**
     * Observer and upserter for VoteCommitted TCR  event
     * @param  {String} log the VoteCommitted event
     */
    await paratii.eth.events.addListener('VoteCommitted', options, function (log) {
      helper.logEvents(log, '🎭  VoteCommitted Event at TCR contract events')
      // saving application result as failed
      Vote.upsert(parser.vote(log, paratii), (err, res) => {
        if (err) {
          throw err
        }
      })
    })

    /**
     * Observer and upserter for VoteRevealed TCR  event
     * @param  {String} log the VoteRevealed event
     */
    await paratii.eth.events.addListener('VoteRevealed', options, function (log) {
      helper.logEvents(log, '🎭  VoteRevealed Event at TCR contract events')
      // saving application as succeeded
      Vote.upsert(parser.vote(log, paratii), (err, res) => {
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

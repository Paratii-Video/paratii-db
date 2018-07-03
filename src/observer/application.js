'use strict'

const Models = require('../models')
const parser = require('../parser')
const Application = Models.application
const Video = Models.video

const helper = require('../helper')

module.exports = function (paratii) {
  var module = {}

  module.init = async function (options) {
    // events hook

    /**
     * Observer and upserter for application TCR  event
     * @param  {String} log the Application event
     */
    await paratii.eth.events.addListener('PHApplication', options, function (log) {
      helper.logEvents(log, '☝  Application Event at TCR contract events')
      // saving application
      Application.upsert(parser.application(log), (err, res) => {
        if (err) {
          throw err
        }
      })

      // setting the video as staked
      Video.stake(parser.application(log), (err, res) => {
        if (err) {
          throw err
        }
      })
    })

    if (options.fromBlock !== undefined) {
      helper.log('    👓  syncing ☝ TCR contract events since the block ' + options.fromBlock)
    } else {
      helper.log('    👓  observing at ☝ TCR contract events')
    }
  }

  return module
}

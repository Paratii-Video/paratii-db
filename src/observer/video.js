'use strict'

const Models = require('../models')
const parser = require('../parser')
const Video = Models.video
const helper = require('../helper')

module.exports = function (paratii) {
  var module = {}

  module.init = async function () {
    // events hook

    await paratii.eth.events.addListener('CreateVideo', function (log) {
      helper.logEvents(log, '📼  CreateVideo Event at Videos contract events')

      Video.upsert(parser.video(log), (err, vid) => {
        if (err) {
          throw err
        }
      })

      if (log.returnValues.ipfsData !== '') {
        // if ipfsdata is present wait for data from ipfs then upsert
        console.log('getting data from ipfs')
        paratii.ipfs.getJSON(log.returnValues.ipfsData).then(function (ipfsData) {
          console.log(ipfsData)
          Video.upsert(parser.video(log, ipfsData), (err, vid) => {
            if (err) {
              throw err
            }
          })
        })
      }
    })

    await paratii.eth.events.addListener('RemoveVideo', function (log) {
      helper.logEvents(log, '📼  RemoveVideo Event at Videos contract events')

      Video.delete(log.returnValues.videoId, (err, res) => {
        if (err) {
          throw err
        }
      })
    })

    helper.log('|      👓  observing at 📼 Videos contract events')
  }

  return module
}

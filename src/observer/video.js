'use strict'

const Models = require('../models')
const parser = require('../parser')
const Video = Models.video

module.exports = function (paratii) {
  var module = {}

  module.init = async function () {
    // events hook

    await paratii.eth.events.addListener('CreateVideo', function (log) {
      Video.upsert(parser.video(log), (err, vid) => {
        if (err) {
          throw err
        }
      })
    })
    await paratii.eth.events.addListener('UpdateVideo', function (log) {
      Video.upsert(parser.video(log), (err, vid) => {
        if (err) {
          throw err
        }
      })
    })
    await paratii.eth.events.addListener('RemoveVideo', function (log) {
      Video.delete(log.returnValues.videoId, (err, res) => {
        if (err) {
          throw err
        }
      })
    })

    console.log('inizialized all video events')
  }

  return module
}

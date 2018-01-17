'use strict'

const Models = require('../models')
const parser = require('../parser')
const Video = Models.video

module.exports = function (paratii) {
  var module = {}

  module.init = function () {
    // events hook
    console.log('inizializing all video events')
    paratii.eth.web3.setProvider('ws://localhost:8546')
    paratii.eth.events.addListener('CreateVideo', function (log) {
      Video.upsert(parser.video(log), (err, vid) => {
        if (err) {
          throw err
        }
      })
    })
  }

  return module
}

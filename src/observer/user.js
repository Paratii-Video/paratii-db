'use strict'

// const Models = require('../../models')
// const Video = Models.video
// let paratiiInstance

module.exports = function (paratii) {
  var module = {}
  // paratiiInstance = paratii

  module.init = async function () {
    // events hook
    await paratii.eth.events.addListener('CreateVideo', function (log) {
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
    console.log('inizialized all user events')
  }

  return module
}

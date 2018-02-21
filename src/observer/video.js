'use strict'

const Models = require('../models')
const parser = require('../parser')
const Video = Models.video

module.exports = function (paratii) {
  var module = {}

  module.init = async function () {
    // events hook

    await paratii.eth.events.addListener('CreateVideo', function (log) {
      console.log('creating video', log.returnValues.videoId)
      console.log('ipfsData', log.returnValues.ipfsData)
      console.log(log)
      Video.upsert(parser.video(log), (err, vid) => {
        if (err) {
          throw err
        }
      })

      // FIX
      // paratii.ipfs.getJSON(log.returnValues.ipfsData).then(function (ipfsData) {
      //   console.log(ipfsData)
      //   Video.upsert(parser.video(log, ipfsData), (err, vid) => {
      //     if (err) {
      //       throw err
      //     }
      //   })
      // })
    })

    await paratii.eth.events.addListener('RemoveVideo', function (log) {
      console.log('removing video ', log.returnValues.videoId)
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

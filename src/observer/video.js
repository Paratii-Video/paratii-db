'use strict'

const Models = require('../models')
const parser = require('../parser')
const Video = Models.video

module.exports = function (paratii) {
  var module = {}

  module.init = async function () {
    // events hook

    await paratii.eth.events.addListener('CreateVideo', function (log) {
      console.log('returnValues', log.returnValues)

      Video.upsert(parser.video(log), (err, vid) => {
        if (err) {
          throw err
        }
      })

      if (log.returnValues.ipfsData !== '') {
        // if ipfsdata is present wait for data from ipfs then upsert
        console.log('getting data from IPFS')
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

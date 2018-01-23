'use strict'

const Models = require('../models')
const parser = require('../parser')
const Video = Models.video

module.exports = function (paratii) {
  var module = {}

  module.init = async function () {
    // events hook

    paratii.eth.web3.setProvider('ws://localhost:8546')

    await paratii.eth.events.addListener('CreateVideo', function (log) {
      Video.upsert(parser.video(log), (err, vid) => {
        if (err) {
          throw err
        }
      })
    })
    console.log('inizialized all video events')

    // let removeVideo = await paratii.eth.events.addListener('RemoveVideo', function (log) {
    //   console.log(log)
    //   const videoId = log.returnValues.videoId
    //   Video.deleteMany({_id: videoId}, (err, vid) => {
    //     if (err) {
    //       throw err
    //     }
    //   })
    // })

    // console.log(removeVideo)
  }

  return module
}

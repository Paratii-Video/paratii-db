'use strict'

const Models = require('../models')
const parser = require('../parser')
const Video = Models.video

module.exports = function (paratii) {
  var module = {}

  module.init = async function () {
    // events hook

    await paratii.eth.events.addListener('CreateVideo', function (log) {
      console.log('|      📼  CreateVideo Event at Videos contract events')
      console.log('|          ####### here the log: #######              ')
      console.log('|                                                     ')
      console.log('|                                                     ')
      console.log('|                                                     ')
      console.log(log)
      console.log('|                                                     ')
      console.log('|                                                     ')
      console.log('|                                                     ')
      console.log('|          ####### end of the log #######             ')

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
      console.log('|      📼  RemoveVideo Event at Videos contract events')
      console.log('|          ####### here the log: #######              ')
      console.log('|                                                     ')
      console.log('|                                                     ')
      console.log('|                                                     ')
      console.log(log)
      console.log('|                                                     ')
      console.log('|                                                     ')
      console.log('|                                                     ')
      console.log('|          ####### end of the log #######             ')

      Video.delete(log.returnValues.videoId, (err, res) => {
        if (err) {
          throw err
        }
      })
    })

    console.log('|      👓  observing at 📼 Videos contract events')
  }

  return module
}

'use strict'

const Models = require('../models')
const parser = require('../parser')
const Video = Models.video
const helper = require('../helper')
const https = require('https')

module.exports = function (paratii) {
  var module = {}

  module.init = async function (options) {
    // events hook
    // TODO: fix getJson ipfsData

    /**
     * Observer and upserter for created video event
     * @param  {String} log the CreateVideo event
     */

    await paratii.eth.events.addListener('CreateVideo', options, function (log) {
      helper.logEvents(log, '📼  CreateVideo Event at Videos contract events')

      if (log.returnValues.ipfsData !== '') {
        // if ipfsdata is present wait for data from ipfs then upsert

        // temporary fix for getting data from ipfs
        let ipfsDataUrl = 'https://gateway.paratii.video/ipfs/' + log.returnValues.ipfsData
        console.log('getting data from ipfs gateway ' + ipfsDataUrl)

        let request = https.get(ipfsDataUrl, function (res) {
          // console.log(res)

          var body = ''

          res.on('data', function (chunk) {
            body += chunk
          })

          res.on('end', function () {
            var ipfsResponse = JSON.parse(body)
            console.log(ipfsResponse)
            Video.upsert(parser.video(log, ipfsResponse), (err, vid) => {
              if (err) {
                throw err
              }
            })
          })
        }).on('error', function (e) {
          console.log('Got an error: ', e)
        })

        request.setTimeout(1000, function () {
          console.log('Time out on getting ipfsData from ' + ipfsDataUrl)
        })
      } else {
        Video.upsert(parser.video(log), (err, vid) => {
          if (err) {
            throw err
          }
        })
      }
    })

    /**
     * Observer and remover for removed video event
     * @param  {String} log the RemoveVideo event
     */
    await paratii.eth.events.addListener('RemoveVideo', options, function (log) {
      helper.logEvents(log, '📼  RemoveVideo Event at Videos contract events')

      Video.delete(log.returnValues.videoId, (err, res) => {
        if (err) {
          throw err
        }
      })
    })

    if (options.fromBlock !== undefined) {
      helper.log('|      👓  syncing 📼 Videos contract events since the block ' + options.fromBlock)
    } else {
      helper.log('|      👓  observing at 📼 Videos contract events')
    }
  }

  return module
}

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

    const async = require('async')

    // manage queue for creating video
    const creatingVideoQueue = async.queue((log, cb) => {
      Video.upsert(parser.video(log), cb)
    }, 1)

    // manage queue for getting video meta
    const gettingVideoMetaQueue = async.queue((log, cb) => {
      let ipfsDataUrl = 'https://gateway.paratii.video/ipfs/' + log.returnValues.ipfsData
      console.log('getting data from ipfs gateway ' + ipfsDataUrl)

      https.get(ipfsDataUrl, function (res) {
        // console.log(res)

        var body = ''

        res.on('data', function (chunk) {
          body += chunk
        })

        res.on('end', function () {
          var data = helper.ifIsJsonGetIt(body)
          if (data) {
            Video.upsert(parser.video(log, data), cb)
          } else {
            cb()
          }
        })
      })
    }, 1)
    console.log("attaching event", options)
    await paratii.eth.events.addListener('CreateVideo', options, function (log) {
      console.log(log)
      helper.logEvents(log, '📼  CreateVideo Event at Videos contract events')
      creatingVideoQueue.push(log)
      if (log.returnValues.ipfsData && log.returnValues.ipfsData !== '') {
        gettingVideoMetaQueue.push(log)
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

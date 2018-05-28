'use strict'
const express = require('express')
const router = express.Router()
const Models = require('../../models')
const Video = Models.video
const Json2csvParser = require('json2csv').Parser

router.get('/:id/related', (req, res, next) => {
  // get related videoss
  // res.json({status: 'not yet implemented'})
  Video.getRelated(req.params.id, (err, videos) => {
    if (err) {
      return res.send(err)
    }

    return res.json(videos)
  })
})

/**
 * get video by _id
 * @param {String}  id  video _id
 */

router.get('/:id', (req, res, next) => {
  Video.findOne({_id: req.params.id}, (err, video) => {
    if (err) return res.send(err)
    res.json(video)
  })
})

/**
 * Get all video or seach
 */

router.get('/', (req, res, next) => {
  const cleanReq = JSON.parse(JSON.stringify(req.query))

  delete cleanReq.format
  delete cleanReq.download

  Video.search(cleanReq, (err, result) => {
    if (err) {
      return res.send(err).statusCode(500)
    }
    // TODO: add query params, total, start, limit and results

    if (req.query.format === 'csv') {
      const fields = ['id', 'title', 'description', 'price', 'duration', 'author', 'createBlockNumber', 'filesize']
      const json2csvParser = new Json2csvParser({fields})

      const csv = json2csvParser.parse(result.results)
      if (req.query.download) {
        res.setHeader('Content-disposition', 'attachment; filename=data.csv')
        res.set('Content-Type', 'text/csv')
      }

      res.status(200).send(csv)
    } else {
      return res.json(result)
    }
  })
})

module.exports = router

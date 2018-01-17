'use strict'
const express = require('express')
const router = express.Router()
const videoAPI = require('./video')

const Models = require('../../models')
const Video = Models.video

router.get('/', (req, res, next) => {
  res.json({test: 1})
})

router.get('/search/:keyword', (req, res, next) => {
  Video.search(req.params.keyword, (err, result) => {
    if (err) {
      return res.send(err).statusCode(500)
    }

    return res.json(result)
  })
})

router.use('/video', videoAPI)

module.exports = router

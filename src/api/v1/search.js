'use strict'
const express = require('express')
const router = express.Router()
const Models = require('../../models')
const Video = Models.video

/**
 * search vids by keyword
 * @param {String}  keyword
 */

router.get('/search/:keyword', (req, res, next) => {
  Video.search(req.params.keyword, (err, result) => {
    if (err) {
      return res.send(err).statusCode(500)
    }

    return res.json(result)
  })
})

module.exports = router

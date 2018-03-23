'use strict'
const express = require('express')
const router = express.Router()
const Models = require('../../models')
const Video = Models.video

router.get('/exports', (req, res, next) => {
  console.log('exports')
  Video.exports((err, result) => {
    if (err) {
      return res.send(err).statusCode(500)
    }
    // TODO: add query params, total, start, limit and results
    let dump = '<ul>'
    for (var i = 0; i < result.length; i++) {
      dump += '<li>'
      dump += 'Title: ' + result[i].title
      dump += '<br>'
      dump += 'Upload name: ' + result[i].author
      dump += '<br>'

      let baseurl = ''
      switch (process.env.NODE_ENV) {
        case 'staging':
          baseurl = 'https://staging.paratii.video/play/'
          break
        case 'production':
          baseurl = 'https://portal.paratii.video/play/'

          break
        case 'development':
          baseurl = 'http://localhost:8080/play/'
          break
      }
      dump += 'Url: '
      dump += '<a href=' + baseurl + result[i]._id + '>'
      dump += baseurl + result[i]._id
      dump += '<a>'

      dump += '</li>'
    }
    dump += '</ul>'
    return res.send(dump)
  })
})

module.exports = router

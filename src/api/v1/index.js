'use strict'
const express = require('express')
const router = express.Router()
const videoAPI = require('./video')

router.get('/', (req, res, next) => {
  res.json({test: 1})
})

router.use('/video', videoAPI)

module.exports = router

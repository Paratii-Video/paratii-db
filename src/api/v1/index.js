'use strict'
const express = require('express')
const router = express.Router()
const videoAPI = require('./video')
const userAPI = require('./user')
// const searchAPI = require('./search')

router.get('/', (req, res, next) => {
  res.json({test: 1})
})

// router.use('/search', searchAPI)
router.use('/videos', videoAPI)
router.use('/users', userAPI)

module.exports = router

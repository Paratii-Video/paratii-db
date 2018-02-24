'use strict'
const express = require('express')
const router = express.Router()
const videoAPI = require('./video')
const userAPI = require('./user')
const transactionAPI = require('./transaction')

const cors = require('cors')
const whitelist = require('./cors.json').whitelisted
let corsOptions = {}

// setting for cors whitelist
if (process.env.NODE_ENV === 'production') {
  corsOptions = {
    origin: function (origin, callback) {
      if (whitelist.indexOf(origin) !== -1) {
        callback(null, true)
      } else {
        callback(new Error('Not allowed by CORS'))
      }
    }
  }
} else if (process.env.NODE_ENV === 'development') {
  corsOptions = {
    origin: function (origin, callback) {
      callback(null, true)
    }
  }
}

router.get('/', (req, res, next) => {
  res.json({test: 1})
})

// initialized REST API routes

router.use('/videos', cors(corsOptions), videoAPI)
router.use('/users', cors(corsOptions), userAPI)
router.use('/transactions', cors(corsOptions), transactionAPI)

module.exports = router

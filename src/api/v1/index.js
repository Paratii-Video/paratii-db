'use strict'
const express = require('express')
const router = express.Router()
const videoAPI = require('./video')
const userAPI = require('./user')
const utilsAPI = require('./utils')
const voteAPI = require('./vote')
const transactionAPI = require('./transaction')
const helper = require('../../helper')

const cors = require('cors')
const whitelist = require('./cors.json').whitelisted
let corsOptions = {}

// setting for cors whitelist
if (process.env.NODE_ENV === 'production') {
  corsOptions = {
    origin: function (origin, callback) {
      // if origin is undefined we are on the same domain
      if (origin === undefined || whitelist.indexOf(origin) !== -1) {
        callback(null, true)
      } else {
        // FIXME: opening cors temporarly
        callback(new Error(origin + 'Not allowed by CORS'))
        // callback(null, true)
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

router.get('/', (req, res) => {
  res.send(helper.printWellcomeLogo())
})

// initialized REST API routes

router.use('/videos', cors(corsOptions), videoAPI)
router.use('/users', cors(corsOptions), userAPI)
router.use('/transactions', cors(corsOptions), transactionAPI)
router.use('/utils', cors(corsOptions), utilsAPI)
router.use('/votes', cors(corsOptions), voteAPI)

module.exports = router

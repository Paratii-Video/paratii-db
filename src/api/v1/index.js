'use strict'
var express = require('express')
var router = express.Router()

router.get('/', (req, res, next) => {
  res.json({test: 1})
})

module.exports = router

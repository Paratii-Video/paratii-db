'use strict'
const express = require('express')
const router = express.Router()
const Models = require('../../models')
const Challenge = Models.challenge

/**
 * get user by _id
 * @param {String}  id  user _id
 */
router.get('/:id', (req, res, next) => {
  Challenge.findOne({_id: req.params.id}, (err, item) => {
    if (err) return res.send(err)
    res.json(item)
  })
})

/**
 * Get all vote or search
 */

router.get('/', (req, res, next) => {
  const cleanReq = JSON.parse(JSON.stringify(req.query))

  Challenge.search(cleanReq, (err, result) => {
    if (err) {
      return res.send(err).statusCode(500)
    }

    return res.json(result)
  })
})

module.exports = router

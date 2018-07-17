'use strict'
const express = require('express')
const router = express.Router()
const Models = require('../../models')
const Vote = Models.vote

/**
 * get user by _id
 * @param {String}  id  user _id
 */
router.get('/:id', (req, res, next) => {
  Vote.findOne({_id: req.params.id}, (err, vote) => {
    if (err) return res.send(err)
    res.json(vote)
  })
})

/**
 * Get all vote or search
 */

router.get('/', (req, res, next) => {
  const cleanReq = JSON.parse(JSON.stringify(req.query))

  Vote.search(cleanReq, (err, result) => {
    if (err) {
      return res.send(err).statusCode(500)
    }

    return res.json(result)
  })
})

module.exports = router

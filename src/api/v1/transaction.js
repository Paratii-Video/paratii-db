'use strict'
const express = require('express')
const router = express.Router()
const Models = require('../../models')
const Transaction = Models.transaction

/**
 * get transactions from/to user _id
 * @param {String}  id  user _id
 */
router.get('/:id', (req, res, next) => {
  Transaction.find({ $or: [ { from: req.params.id }, { to: req.params.id } ] }, (err, user) => {
    if (err) return res.send(err)
    res.json(user)
  })
})

/**
 * get transactions
 */
router.get('/', (req, res, next) => {
  Transaction.find({ }, (err, user) => {
    if (err) return res.send(err)
    res.json(user)
  })
})

module.exports = router

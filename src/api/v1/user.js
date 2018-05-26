'use strict'
const express = require('express')
const router = express.Router()
const Models = require('../../models')
const User = Models.user
const Video = Models.video

/**
 * get user by _id
 * @param {String}  id  user _id
 */
router.get('/:id', (req, res, next) => {
  User.findOne({_id: req.params.id}, (err, user) => {
    if (err) return res.send(err)
    res.json(user)
  })
})

/**
 * get user videos by _id
 * @param {String}  id  user _id
 */
router.get('/:id/videos', (req, res, next) => {
  Video.find({owner: req.params.id}, (err, user) => {
    if (err) return res.send(err)
    res.json(user)
  })
})

/**
 * create user email by _id
 * @param {String}  id  user _id
 */
router.get('/create/:id/:email', (req, res, next) => {
  var origin = req.get('origin')
  var address = req.params.id
  var email = req.params.email
  if (origin && (origin === 'https://portal.paratii.video' || origin === 'https://staging.paratii.video')) {
    User.upsert({_id: address, email}, (err, user) => {
      if (err) {
        throw err
      }
      res.json(user)
    })
  }
})

module.exports = router

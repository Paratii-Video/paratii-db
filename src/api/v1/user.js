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
router.get('/:id/video', (req, res, next) => {
  Video.find({owner: req.params.id}, (err, user) => {
    if (err) return res.send(err)
    res.json(user)
  })
})

module.exports = router

'use strict'
const express = require('express')
const router = express.Router()
const Models = require('../../models')
const User = Models.user
const Video = Models.video
const paratiilib = require('paratii-js')

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
router.post('/:id/', (req, res, next) => {
  var address = req.params.id
  var email = req.body.email
  var hashedEmail = req.body.hashedEmail
  var signedEmail = req.body.signedEmail
  var whoSigned = req.body.whoSigned
  let paratii = new paratiilib.Paratii()

  console.log('checking signature', paratii.eth.distributor.checkSignedmessage(hashedEmail, signedEmail, whoSigned) ? 'valid': 'invalid')


  // TODO: in a second iteration user need to sign the email, here we will check the signature.
  if (paratii.eth.distributor.checkSignedmessage(hashedEmail, signedEmail, whoSigned)) {
    User.upsert({_id: address, email}, (err, user) => {
      if (err) {
        throw err
      }
      res.json(user)
    })
  } else {
    res.send('Missing origin')
  }
})

module.exports = router

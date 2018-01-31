'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const UserSchema = new Schema({

  _id: {type: String, index: true},
  name: {type: String, index: true},
  email: {type: String, index: true},
  ipfsHash: String
})

const User = mongoose.model('User', UserSchema)

module.exports = User

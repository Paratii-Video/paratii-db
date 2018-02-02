'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const UserSchema = new Schema({

  _id: {type: String, index: true},
  name: {type: String, index: true},
  email: {type: String, index: true},
  ipfsHash: String
})

UserSchema.statics.upsert = function (user, cb) {
  if (!user || !user._id) {
    return cb(new Error('user._id is required for upsert'))
  }

  this.findByIdAndUpdate(user._id,
  {$set: user},
  {new: true, upsert: true}, cb)
}

UserSchema.statics.delete = function (userId, cb) {
  const query = {
    _id: userId
  }
  this.remove(query).exec((err, result) => {
    if (err) {
      return cb(err)
    }

    return cb(null, true)
  })
}

const User = mongoose.model('User', UserSchema)

module.exports = User

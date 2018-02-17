'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema
const { eachLimit } = require('async')

const UserSchema = new Schema({

  _id: {type: String},
  name: {type: String},
  email: {type: String},
  ipfsData: String
},
{ emitIndexErrors: true, autoIndex: true })

UserSchema.index({name: 'text', email: 'text'})

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

UserSchema.statics.bulkUpsert = function (users, cb) {
  if (!Array.isArray(users)) {
    users = [users]
  }

  eachLimit(users, 50, (user, callback) => {
    this.findByIdAndUpdate(user._id,
    {$set: user},
    {new: true, upsert: true}, callback)
  }, (err) => {
    if (err) return cb(err)
    return cb(null, true)
  })
}

/**
 * find user based on a keyword or params
 * @param  {String}   keyword word to query db with.
 * @param  {Function} cb      (err, result)
 * @return {Array}           returns an array of videos matching keyword. limited to 6
 */
UserSchema.statics.search = function (query, cb) {
  let baseSearch = { $text: { $search: query.keyword } }
  if (Object.keys(query).length === 1 && query.keyword !== undefined) {
    // this is a full text search on video
    this.find(baseSearch).exec((err, result) => {
      if (err) {
        return cb(err)
      }

      return cb(null, result)
    })
  } else {
    let search = Object.assign(baseSearch, query)
    delete search['keyword']

    this.find(search).exec((err, result) => {
      if (err) {
        return cb(err)
      }

      return cb(null, result)
    })
  }

  // TODO Add pagination
}

const User = mongoose.model('User', UserSchema)

module.exports = User

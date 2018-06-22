'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema
const paratiilib = require('paratii-js')

const { eachLimit } = require('async')

const UserSchema = new Schema({

  _id: {type: String},
  name: {type: String},
  email: {type: String},
  emailIsVerified: {type: Boolean},
  blockNumber: Number,
  blockTimestamp: Number,
  createBlockNumber: Number,
  createBlockTimestamp: Number,
  ipfsData: String
},
{ emitIndexErrors: true, autoIndex: true })

UserSchema.index({name: 'text', email: 'text'})

UserSchema.statics.findLastBlockNumber = async function () {
  let result = await this.findOne({ }).sort('-blockNumber').exec()
  if (!result) {
    result = {}
    result.blockNumber = 0
  }
  return result.blockNumber
}

/**
 * Upsert parsed transaction event
 * @param  {Object}   user a parsed user log
 * @param  {Function} cb      (err, result)
 * @return {Object | Error}        the upsert user document or an error
 */
UserSchema.statics.upsert = async function (userPromise, cb) {
  let user = await userPromise
  if (!user || !user._id) {
    throw new Error('user._id is required for upsert')
  }

  var query = {_id: user._id}
  // check if the user already exists
  var existingUser = await this.findOne(query).exec()

  // we do not know in what order the event logs arrive, so we need some logic
  // to make sure we update the record with the latest block number
  if (!existingUser) {
    console.log('############# creating user createBlock',user)

    user.createBlockNumber = user.blockNumber
    user.createBlockTimestamp = user.blockTimestamp

    this.findOneAndUpdate(query, user, {upsert: true, new: true}, cb)
  } else if (user.blockNumber < existingUser.createBlockNumber) {
    // we have already inserted a existingUser  that that is more recent than "user"
    // so we only update the createBlockNumber
    console.log('############# updating createBlock',user)

    this.findOneAndUpdate(query, { $set: { createBlockNumber: user.blockNumber, createBlockTimestamp: user.blockTimestamp } }, cb)
  } else {
    delete user.createBlockNumber
    this.findOneAndUpdate(query, user, {upsert: true, new: true}, cb)
  }
}

/**
 * Delete an user
 * @param  {String}   userId the id of the user to delete
 * @param  {Function} cb      (err, result)
 * @return {Boolean}          if the query has success
 */
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

/**
 * verifyemail
 * @param  {Object}   distribution Json objects
 * @param  {Function} cb    (err, success)
 * @return {[type]}         [description]
 */

UserSchema.statics.verify = function (distribution, cb) {
  if (!distribution || !distribution.reason || distribution.reason !== 'email_verification') {
    return cb(new Error('distribution._reason must be email_verification'))
  }
  if (!distribution || !distribution.toAddress) {
    return cb(new Error('distribution._toAddress is required for verify something'))
  }

  var query = {_id: distribution.toAddress}

  this.findOneAndUpdate(query, { 'emailIsVerified': true }, {upsert: true}, cb)
}

/**
 * Bulkupsert users events
 * @param  {Array}   users an array of parsed user object
 * @param  {Function} cb      (err, result)
 * @return {Object | Error} gives the updated documents or an error
 */
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
 * @return {Array}           returns an array of users matching keyword. limited to 6
 */
UserSchema.statics.search = function (query, cb) {
  let search
  let baseSearch = { $text: { $search: query.keyword } }

  // Pagination variable
  let offset = parseInt(query.offset)
  let limit = parseInt(query.limit)
  let areInt = (offset === parseInt(offset, 10)) === (limit === parseInt(limit, 10))

  // Setting the query parameters
  if (Object.keys(query).length === 1 && query.keyword !== undefined) {
    // A SIMPLE SEARCH
    search = baseSearch
  } else if (Object.keys(query).length > 1 && query.keyword !== undefined) {
    // A SIMPLE SEARCH WITH EXTRA FILTER
    search = Object.assign(baseSearch, query)
    delete search['keyword']
  } else {
    // GET ALL THE VIDEOS
    search = {}
  }
  delete search['offset']
  delete search['limit']

  let find = this.find(search)

  // Setting Pagination
  if (offset && offset !== 0 && areInt) {
    find = find.skip(offset)
  }
  // Setting Pagination
  if (limit && areInt) {
    find = find.limit(limit)
  }

  find.exec((err, result) => {
    if (err) {
      return cb(err)
    }

    var parseResult = {}
    parseResult.results = result
    parseResult.query = query
    parseResult.total = result.length
    return cb(null, parseResult)
  })
}

const User = mongoose.model('User', UserSchema)

module.exports = User

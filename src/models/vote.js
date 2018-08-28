'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const { eachLimit } = require('async')

const VoteSchema = new Schema({
  voter: String,
  pollID: String,
  numTokens: Number,
  choice: Number, // choice is either 0 or 1, or null
  voteCommitted: Number, // timestamp,
  voteRevealed: Number,
  blockNumber: Number
})

VoteSchema.index({voter: 'text'})

// schema transformation for VoteSchema
if (!VoteSchema.options.toObject) VoteSchema.options.toObject = {}
VoteSchema.options.toObject.transform = function (doc, ret, options) {
  // remove the _id of every document before returning the result
  ret.id = ret._id
  delete ret._id
  return ret
}

/**
 * Upsert parsed vote events
 * @param  {Object}   tx a parsed vote log
 * @param  {Function} cb      (err, result)
 * @return {Boolean}      how the upsert goes
 */
VoteSchema.statics.upsert = async function (votePromises, cb) {
  let vote = await votePromises
  if (!vote || !vote.voter || !vote.pollID) {
    return cb(new Error('vote.voter and vote.pollID is required for upsert'))
  }

  this.collection.findAndModify({pollID: vote.pollID, voter: vote.voter}, null, {$set: vote}, {new: true, upsert: true}, cb)
}

VoteSchema.statics.findAndModify = function (query, sort, doc, options, callback) {
  return this.collection.findAndModify(query, sort, doc, options, callback)
}

VoteSchema.statics.findLastBlockNumber = async function () {
  let result = await this.findOne({ }).sort('-blockNumber').exec()
  if (!result) {
    result = {}
    result.blockNumber = 0
  }
  return result.blockNumber
}

/**
 * bulk upsert videos into the DB
 * @param  {Array}   videos Array of Json video objects
 * @param  {Function} cb     (err, success)
 * @return {Boolean}          returns error or success once all videos are in.
 */
VoteSchema.statics.bulkUpsert = function (votes, cb) {
  if (!Array.isArray(votes)) {
    votes = [votes]
  }

  eachLimit(votes, 50, (vote, callback) => {
    this.collection.findAndModify({pollID: vote.pollID, voter: vote.voter}, null, {$set: vote}, {new: true, upsert: true}, callback)
  }, (err) => {
    if (err) return cb(err)
    return cb(null, true)
  })
}

/**
 * find vote based on a keyword or params
 * @param  {String}   keyword word to query db with.
 * @param  {Function} cb      (err, result)
 * @return {Array}           returns an array of votes matching keyword. limited to 6
 */
VoteSchema.statics.search = function (query, cb) {
  let search
  let baseSearch = { $text: { $search: query.keyword } }

   // this is due query is an referenced object
  const originalQuery = JSON.parse(JSON.stringify(query))
   // Pagination variable
  let offset = parseInt(query.offset)
  let limit = parseInt(query.limit)

  let isOffsetInt = (offset === parseInt(offset, 10))
  let isLimitInt = (limit === parseInt(limit, 10))

   // Setting the query parameters
  if (Object.keys(query).length === 1 && query.keyword !== undefined) {
     // A SIMPLE SEARCH

    search = baseSearch
  } else if (Object.keys(query).length >= 1 && query.keyword !== undefined) {
     // A SIMPLE SEARCH WITH EXTRA FILTER
    search = Object.assign(baseSearch, query)
    delete search['keyword']
  } else if (Object.keys(query).length >= 1 && query.keyword === undefined) {
     // A SIMPLE SEARCH WITH EXTRA FILTER
    search = Object.assign(query)
    delete search['keyword']
  } else {
     // GET ALL THE VIDEOS
    search = {}
  }

   // Cleaning up search query
  delete search['offset']
  delete search['limit']

  let find = this.find(search)
   // Setting Pagination
  if (offset && offset !== 0 && isOffsetInt) {
    find = find.skip(offset)
  }
   // Setting Pagination

  if (limit && isLimitInt) {
     // increment limit by one in order to know if could be a new page
    find = find.limit(limit + 1)
  }

  find.exec((err, result) => {
    if (err) {
      return cb(err)
    }

    var parseResult = {}
     // compensate for hasNext increment
    const hasNext = result.length > limit
    parseResult.total = result.length === 0 ? 0 : result.length
    parseResult.results = hasNext ? result.slice(0, result.length - 1) : result
    parseResult.hasNext = hasNext
    parseResult.query = originalQuery
    return cb(null, parseResult)
  })

    // TODO Add pagination
}

const Vote = mongoose.model('Vote', VoteSchema)

module.exports = Vote

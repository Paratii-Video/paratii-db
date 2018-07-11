'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const { eachLimit } = require('async')

const ChallengeSchema = new Schema({
  _id: String,
  listingHash: String,
  rewardPool: Number,
  challenger: String,
  resolved: Boolean,
  stake: Number,
  totalTokens: Number,
  voterCanClaimReward: Boolean,
  commitStartDate: Number,
  commitEndDate: Number,
  revealEndDate: Number,
  voteQuorum: Number,
  votesFor: Number,
  votesAgainst: Number,
  blockNumber: Number
})

ChallengeSchema.index({challenger: 'text'})

// schema transformation for ChallengeSchema
if (!ChallengeSchema.options.toObject) ChallengeSchema.options.toObject = {}
ChallengeSchema.options.toObject.transform = function (doc, ret, options) {
  // remove the _id of every document before returning the result
  ret.id = ret._id
  delete ret._id
  return ret
}

/**
 * Upsert parsed vote events
 * @param  {Object}   tx a parsed challenge log
 * @param  {Function} cb      (err, result)
 * @return {Boolean}      how the upsert goes
 */
ChallengeSchema.statics.upsert = function (ch, cb) {
  if (!ch || !ch._id) {
    return cb(new Error('ch._id is required for upsert'))
  }

  this.findByIdAndUpdate(ch._id,
   {$set: ch},
   {new: true, upsert: true}, cb)
}

ChallengeSchema.statics.findLastBlockNumber = async function () {
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
ChallengeSchema.statics.bulkUpsert = function (chs, cb) {
  if (!Array.isArray(chs)) {
    chs = [chs]
  }

  eachLimit(chs, 50, (ch, callback) => {
    this.findByIdAndUpdate(ch._id,
    {$set: ch},
    {new: true, upsert: true}, callback)
  }, (err) => {
    if (err) return cb(err)
    return cb(null, true)
  })
}

/**
 * find challenge based on a keyword or params
 * @param  {String}   keyword word to query db with.
 * @param  {Function} cb      (err, result)
 * @return {Array}           returns an array of challenges matching keyword. limited to 6
 */
ChallengeSchema.statics.search = function (query, cb) {
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

const Challenge = mongoose.model('Challenge', ChallengeSchema)

module.exports = Challenge

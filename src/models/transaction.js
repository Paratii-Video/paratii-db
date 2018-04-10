'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema
const { eachLimit } = require('async')

const TransactionSchema = new Schema({
  _id: String,
  blockNumber: Number,
  event: String,
  description: String,
  from: String,
  logIndex: Number,
  nonce: Number,
  source: String,
  to: String,
  value: Number // FIXME use BigNumber.js here <===
},
{ emitIndexErrors: true, autoIndex: true })

TransactionSchema.index({from: 'text', to: 'text', description: 'text'})

TransactionSchema.statics.findLastBlockNumber = async function () {
  let result = await this.findOne({ }).sort('-blockNumber').exec()
  if (!result) {
    result = {}
    result.blockNumber = 0
  }
  return result.blockNumber
}

/**
 * Upsert parsed transaction events
 * @param  {Object}   tx a parsed transaction log
 * @param  {Function} cb      (err, result)
 * @return {Boolean}      how the upsert goes
 */
TransactionSchema.statics.upsert = function (tx, cb) {
  if (!tx || !tx._id) {
    return cb(new Error('tx._id is required for upsert'))
  }

  this.findByIdAndUpdate(tx._id,
  {$set: tx},
  {new: true, upsert: true}, cb)
}

/**
 * Bulkupsert transactions events
 * @param  {Array}   txs an array of parsed transaction object
 * @param  {Function} cb      (err, result)
 * @return {Object | Error} gives the updated documents or an error
 */
TransactionSchema.statics.bulkUpsert = function (txs, cb) {
  if (!Array.isArray(txs)) {
    txs = [txs]
  }

  eachLimit(txs, 50, (tx, callback) => {
    this.findByIdAndUpdate(tx._id,
    {$set: tx},
    {new: true, upsert: true}, callback)
  }, (err) => {
    if (err) return cb(err)
    return cb(null, true)
  })
}
/**
 * Search inside transactions collection
 * @param  {Object}   query
 * @param  {Function} cb      (err, result)
 * @return {Array | Error}         gives results or an error
 */
TransactionSchema.statics.search = function (query, cb) {
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
const Transaction = mongoose.model('Transaction', TransactionSchema)

module.exports = Transaction

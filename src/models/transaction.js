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

TransactionSchema.statics.upsert = function (tx, cb) {
  if (!tx || !tx._id) {
    return cb(new Error('tx._id is required for upsert'))
  }

  this.findByIdAndUpdate(tx._id,
  {$set: tx},
  {new: true, upsert: true}, cb)
}

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

TransactionSchema.statics.search = function (query, cb) {
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
const Transaction = mongoose.model('Transaction', TransactionSchema)

module.exports = Transaction

'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema
const { eachLimit } = require('async')

const VoucherSchema = new Schema({
  _id: String,
  voucherCode: String,
  amount: Number,
  claimant: String
})

/**
 * upsert
 * @param  {Object}   video Json objects
 * @param  {Function} cb    (err, success)
 * @return {[type]}         [description]
 */
VoucherSchema.statics.upsert = function (tx, cb) {
  if (!tx || !tx._id) {
    return cb(new Error('tx._id is required for upsert'))
  }

  this.findByIdAndUpdate(tx._id,
  {$set: tx},
  {new: true, upsert: true}, cb)
}
/**
 * bulk upsert vouchers into the DB
 * @param  {Array}   videos Array of Json voucher objects
 * @param  {Function} cb     (err, success)
 * @return {Boolean}          returns error or success once all videos are in.
 */
VoucherSchema.statics.bulkUpsert = function (txs, cb) {
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

const Transaction = mongoose.model('Voucher', VoucherSchema)

module.exports = Transaction

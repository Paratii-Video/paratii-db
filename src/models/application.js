'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ApplicationSchema = new Schema({
  _id: String,
  deposit: Number,
  appEndDate: Number,
  blockNumber: Number,
  data: String,
  applicant: String
})

/**
 * Upsert parsed application events
 * @param  {Object}   tx a parsed application log
 * @param  {Function} cb      (err, result)
 * @return {Boolean}      how the upsert goes
 */
ApplicationSchema.statics.upsert = function (tx, cb) {
  if (!tx || !tx._id) {
    return cb(new Error('tx._id is required for upsert'))
  }

  this.findByIdAndUpdate(tx._id,
   {$set: tx},
   {new: true, upsert: true}, cb)
}

ApplicationSchema.statics.findLastBlockNumber = async function () {
  let result = await this.findOne({ }).sort('-blockNumber').exec()
  if (!result) {
    result = {}
    result.blockNumber = 0
  }
  return result.blockNumber
}


/**
 * delete application by applicationid
 * @param  {videoId}   videoId.
 * @param  {Function} cb      (err, result)
 * @return {Boolean}          returns error or success once application is deleted.
 */
ApplicationSchema.statics.delete = function (applicationId, cb) {
  const query = {
    _id: applicationId
  }
  this.remove(query).exec((err, result) => {
    if (err) {
      return cb(err)
    }

    return cb(null, true)
  })
}

const Application = mongoose.model('Application', ApplicationSchema)

module.exports = Application

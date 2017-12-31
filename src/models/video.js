'use strict'
const { eachLimit } = require('async')
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const VideoSchema = new Schema({
  _id: {type: String, index: true},
  title: {type: String, index: true},
  description: {type: String, index: true},
  price: Number, // FIXME this should be bignumber.js
  src: String,
  mimetype: String,
  stats: {
    likes: Number,
    dislikes: Number,
    likers: Array,
    dislikers: Array
  },
  uploader: {
    name: {type: String, index: true}
  },
  tags: {type: Array, index: true}
})

VideoSchema.statics.upsert = function (video, cb) {
  if (!video || !video._id) {
    return cb(new Error('video._id is required for upsert'))
  }

  this.findByIdAndUpdate(video._id,
  {$set: video},
  {new: true, upsert: true}, cb)
}

/**
 * bulk upsert videos into the DB
 * @param  {Array}   videos Array of Json video objects
 * @param  {Function} cb     (err, success)
 * @return {Boolean}          returns error or success once all videos are in.
 */
VideoSchema.statics.bulkUpsert = function (videos, cb) {
  if (!Array.isArray(videos)) {
    videos = [videos]
  }

  eachLimit(videos, 50, (video, callback) => {
    this.findByIdAndUpdate(video._id,
    {$set: video},
    {new: true, upsert: true}, callback)
  }, (err) => {
    if (err) return cb(err)
    return cb(null, true)
  })
}

const Video = mongoose.model('Video', VideoSchema)

module.exports = Video

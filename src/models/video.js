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
  owner: String,
  stats: {
    likes: Number,
    dislikes: Number,
    likers: Array,
    dislikers: Array
  },
  uploader: {
    name: {type: String, index: true},
    address: {type: String, index: true}
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

/**
 * get related videos, currently it randomly returns 6 videos.
 * @param  {String}   videoId id of the video you wanna get related videos to.
 * @param  {Function} cb      (err, result)
 * @return {Array}           returns an array of videos related.
 */
VideoSchema.statics.getRelated = function (videoId, cb) {
  if (!videoId) {
    return cb(new Error('video id is required for getting related ones'))
  }

  this.aggregate([
    { $sample: {size: 6} }
  ]).exec((err, result) => {
    if (err) {
      return cb(err)
    }

    return cb(null, result)
  })
}

/**
 * find videos based on a keyword
 * @param  {String}   keyword word to query db with.
 * @param  {Function} cb      (err, result)
 * @return {Array}           returns an array of videos matching keyword. limited to 6
 */
VideoSchema.statics.search = function (keyword, cb) {
  const query = {
    $or: [
      { title: {$regex: keyword, $options: '-i'} },
      { description: {$regex: keyword, $options: '-i'} },
      { 'uploader.name': {$regex: keyword, $options: '-i'} },
      { tags: {$regex: keyword, $options: '-i'} }
    ]
  }

  // TODO Add pagination

  this.find(query).limit(6).exec((err, result) => {
    if (err) {
      return cb(err)
    }

    return cb(null, result)
  })
}

/**
 * delete video by videoid
 * @param  {videoId}   videoId.
 * @param  {Function} cb      (err, result)
 * @return {Boolean}          returns error or success once video is deleted.
 */
VideoSchema.statics.delete = function (videoId, cb) {
  const query = {
    _id: videoId
  }
  this.remove(query).exec((err, result) => {
    if (err) {
      return cb(err)
    }

    return cb(null, true)
  })
}

const Video = mongoose.model('Video', VideoSchema)

module.exports = Video

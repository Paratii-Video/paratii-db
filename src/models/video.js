'use strict'
const { eachLimit } = require('async')
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const VideoSchema = new Schema({
  _id: {type: String},
  title: {type: String},
  description: {type: String},
  price: Number, // FIXME this should be bignumber.js
  ipfsHash: String,
  ipfsData: String,
  ipfsHashOrig: String,
  duration: String,
  mimetype: String,
  author: String,
  free: String,
  blockNumber: Number,
  createBlockNumber: Number,
  storageStatus: Object,
  transcodingStatus: Object,
  staked: Object,
  filesize: String,
  filename: String,
  uploadStatus: Object,
  thumbnails: Array,
  published: String,
  owner: {type: String},
  stats: {
    likes: Number,
    dislikes: Number,
    likers: Array,
    dislikers: Array
  },
  uploader: {
    name: {type: String},
    address: {type: String}
  },
  tags: {type: [String]}
},
{ emitIndexErrors: true, autoIndex: true })

// definition of compound indexes
VideoSchema.index({title: 'text', description: 'text', owner: 'text', 'uploader.name': 'text', 'uploader.address': 'text', tags: 'text', author: 'text'})

/**
 * upsert
 * @param  {Object}   video Json objects
 * @param  {Function} cb    (err, success)
 * @return {[type]}         [description]
 */

VideoSchema.statics.upsert = async function (video) {
  if (!video || !video._id) {
    throw new Error('video._id is required for upsert')
  }

  var query = {_id: video._id}
  // check if the video already exists
  var existingVideo = await this.find(query).exec()
  console.log(existingVideo)
  // we do not know in what order the event logs arrive, so we need some logic
  // to make sure we update the record with the latest block number
  console.log(`calling findOneAndUpdate with ${query._id} and blocknumber ${video.blockNumber}`)
  if (!existingVideo) {
      video.createBlockNumber = video.blockNumber
      console.log("video did not exist yet")
      await this.insert(video).exec()
  } else if (video.blockNumber < existingVideo.blockNumber) {
      // we have already inserted a existingVideo  that that is more recent than "video"
      // so we only update the createBlockNumber
      console.log("updating only createBlocknumber")
      existingVideo.createBlockNumber = video.blockNumber
      await this.findOneAndUpdate(query, {$set: { createBlockNumber: video.blockNumber}}).exec()
  } else {
      // video.blockNumber > = existingVideo.blockNumber
      console.log('updating with more recent version')
      // const cb =  (err, vid) => {
      //   if (err) {
      //     console.log(err)
      //     console.log('RETRYING')
      //     this.findOneAndUpdate(query, video, {upsert: true}, cb)
      //   }
      // }
      await this.findOneAndUpdate(query, video, {upsert: true}).exec()
  }
}

/**
 * stake
 * @param  {Object}   application Json objects
 * @param  {Function} cb    (err, success)
 * @return {[type]}         [description]
 */
VideoSchema.statics.stake = function (application, cb) {
  if (!application || !application._id) {
    return cb(new Error('application._id is required for staking'))
  }
  var query = {_id: application._id}

  this.update(query, { $set: { staked: application } }, cb)
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
 * find videos based on a keyword or params
 * @param  {String}   keyword word to query db with.
 * @param  {Function} cb      (err, result)
 * @return {Array}           returns an array of videos matching keyword. limited to 6
 */
VideoSchema.statics.search = function (query, cb) {
  // TODO: keep it simple and readable

  let baseSearch = { $text: { $search: query.keyword } }
  if (Object.keys(query).length === 1 && query.keyword !== undefined) {
     // this is a full text search on video
    this.find(baseSearch).exec((err, result) => {
      if (err) {
        return cb(err)
      }

      return cb(null, result)
    })
  } else if (Object.keys(query).length > 1 && query.keyword !== undefined) {
     // this is a full text search on video with other fields
    let search = Object.assign(baseSearch, query)
    delete search['keyword']

    this.find(search).exec((err, result) => {
      if (err) {
        return cb(err)
      }

      return cb(null, result)
    })
  } else {
     // this is a full list of videos
    this.find(query).exec((err, result) => {
      if (err) {
        return cb(err)
      }

      return cb(null, result)
    })
  }

   // TODO Add pagination
}

VideoSchema.statics.findLastBlockNumber = async function () {
  let result = await this.findOne({ }).sort('-blockNumber').exec()
  if (!result) {
    result = {}
    result.blockNumber = 0
  }
  return result.blockNumber
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

VideoSchema.statics.exports = function (cb) {
  const query = {ipfsHash: {$ne: ''}}
  const mask = {}
  // const mask = {title: 1, owner: 1, blockNumber:1}
  const sort = {blockNumber: -1}
  this.find(query, mask).sort(sort).exec((err, result) => {
    if (err) {
      return cb(err)
    }

    return cb(null, result)
  })
}
const Video = mongoose.model('Video', VideoSchema)

module.exports = Video

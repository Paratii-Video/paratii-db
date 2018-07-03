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
  blockTimestamp: Number,
  createBlockNumber: Number,
  createBlockTimestamp: Number,
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

// schema transformation for videoschema
if (!VideoSchema.options.toObject) VideoSchema.options.toObject = {}
VideoSchema.options.toObject.transform = function (doc, ret, options) {
  // remove the _id of every document before returning the result
  ret.id = ret._id
  delete ret._id
  return ret
}

/**
 * upsert
 * @param  {Object}   video Json objects
 * @param  {Function} cb    (err, success)
 * @return {[type]}         [description]
 */

VideoSchema.statics.upsert = async function (videoPromise, cb) {
  let video = await videoPromise
  if (!video || !video._id) {
    throw new Error('video._id is required for upsert')
  }

  var query = {_id: video._id}
  // check if the video already exists
  var existingVideo = await this.findOne(query).exec()

  // we do not know in what order the event logs arrive, so we need some logic
  // to make sure we update the record with the latest block number
  if (!existingVideo) {
    video.createBlockNumber = video.blockNumber
    video.createBlockTimestamp = video.blockTimestamp
    await this.findOneAndUpdate(query, video, {upsert: true}).exec()
  } else if (video.blockNumber < existingVideo.createBlockNumber) {
      // we have already inserted a existingVideo  that that is more recent than "video"
      // so we only update the createBlockNumber
    await this.findOneAndUpdate(query, { $set: { createBlockNumber: video.blockNumber, createBlockTimestamp: video.blockTimestamp } }).exec()
  } else {
    delete video.createBlockNumber
    await this.findOneAndUpdate(query, video, {upsert: true}).exec()
  }

  cb()
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

  this.findOneAndUpdate(query, { staked: application }, {upsert: true}, cb)
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
  let search
  let baseSearch = { $text: { $search: query.keyword } }

  // this is due query is an referenced object
  const originalQuery = JSON.parse(JSON.stringify(query))
  // Pagination variable
  let offset = parseInt(query.offset)
  let limit = parseInt(query.limit)

  let isOffsetInt = (offset === parseInt(offset, 10))
  let isLimitInt = (limit === parseInt(limit, 10))

  // Staking FILTER
  let staked = query.staked !== undefined ? query.staked : undefined

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
  delete search['staked']

  // Setting Staked FILTER
  if (staked !== undefined) {
    if (staked === 'true') {
      let stakedQuery = {'staked': {'$ne': null}}
      search = Object.assign(search, stakedQuery)
    } else {
      let stakedQuery = {'staked': null}
      search = Object.assign(search, stakedQuery)
    }
  }

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

VideoSchema.statics.updateUsername = async function (userPromise, cb) {
  let user = await userPromise
  if (!user || !user._id) {
    throw new Error('user._id is required for updateUsername')
  }

  var query = {owner: user._id}
  var updateData = {author: user.name}
  // check if the video already exists
  this.update(query, updateData, {upsert: false, multi: true}, function (err, result) {
    if (err) {
      return cb(err)
    }

    return cb(null, result)
  })
}

const Video = mongoose.model('Video', VideoSchema)

module.exports = Video

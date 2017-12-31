'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const VideoSchema = new Schema({
  id: {type: String, index: true},
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

const Video = mongoose.model('Video', VideoSchema)

module.exports = Video

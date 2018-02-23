'use strict'

const mongoose = require('mongoose')
const config = require('../../default-config.js')

// NOTE: options is **required** for mongoose v5
var options = {
  // useMongoClient: true,
  autoIndex: false, // Don't build indexes
  reconnectTries: Number.MAX_VALUE, // Never stop trying to reconnect
  reconnectInterval: 500, // Reconnect every 500ms
  poolSize: 10, // Maintain up to 10 socket connections
  // If not connected, return errors immediately rather than waiting for reconnect
  bufferMaxEntries: 0
}

mongoose.connect(config.mongodb.url, options)

const db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', () => {
  console.log('|      MONGO ready for saving incoming events')
})

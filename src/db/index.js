'use strict'

require('dotenv').load()
const mongoose = require('mongoose')
const helper = require('../helper')
const dbConfiguration = require('../../dbconfig.json')

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

if (process.env.NODE_ENV === 'docker-development') {
  dbConfiguration[process.env.NODE_ENV].mongodb.url = 'mongodb://' + process.env.LOCAL_IP + ':27017/test'
  mongoose.connect(dbConfiguration[process.env.NODE_ENV].mongodb.url, options)
} else {
  mongoose.connect(dbConfiguration[process.env.NODE_ENV].mongodb.url, options)
}

const db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', () => {
  helper.log('    MONGO ready for saving incoming events')
})

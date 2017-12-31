'use strict'

const mongoose = require('mongoose')
const config = require('../../default-config.js')

mongoose.connect(config.mongodb.url)

const db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', () => {
  console.log('MONGODB connected!')
})

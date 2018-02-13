'use strict'

const express = require('express')
const compression = require('compression')
const paratiilib = require('paratii-lib')

const api = require('./api/v1')
let observer = null

require('./db')

const app = express()

if (process.env.NODE_ENV === 'production') {
  start('ws://localhost:8546')
} else {
  start()
}

async function start (registry, provider) {
  // Overlooking Blockchain obSERVER
  if (process.env.NODE_ENV === 'production') {
    console.log('production')
    observer = require('./observer')(paratiilib.Paratii, '0x0B101ff870F8BAd6c437C45eCb2964D7e8034593', provider)
  } else {
    observer = require('./observer')(paratiilib.Paratii)
  }

  observer.videoObserver.init()
  observer.userObserver.init()
  observer.transactionObserver.init()

  app.use(compression())
  app.use(express.json())

  app.use('/api/v1', api)

  app.listen(3000)
  console.log('listening at 3000')
}

module.exports.start = start

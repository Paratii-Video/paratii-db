'use strict'

const express = require('express')
const compression = require('compression')

const api = require('./api/v1')

require('./db')

const app = express()

start()

async function start () {
  // Overlooking Blockchain obSERVER

  // observer = require('./observer')(paratiilib.Paratii)
  // observer.videoObserver.init()
  // observer.userObserver.init()
  // observer.transactionObserver.init()

  app.use(compression())
  app.use(express.json())

  app.use('/api/v1', api)

  app.listen(3000)
  console.log('listening at 3000')
}

module.exports.start = start

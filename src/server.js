'use strict'

const express = require('express')
const compression = require('compression')
const paratiilib = require('paratii-lib')

const api = require('./api/v1')
let observer = null

require('./db')

const app = express()

function stop (app) {
  app.close()
}

function start (registry) {
  // Overlooking Blockchain obSERVER
  observer = require('./observer')(paratiilib.Paratii, registry)
  observer.videoObserver.init()
  observer.userObserver.init()
  observer.transactionObserver.init()
  let server
  if (registry) {
    app.use(compression())
    app.use(express.json())

    app.use('/api/v1', api)

    server = app.listen(3000)
    console.log('listening at 3000')
  } else {
    throw Error('Registry address needed!')
  }

  return server
}

module.exports.start = start
module.exports.stop = stop

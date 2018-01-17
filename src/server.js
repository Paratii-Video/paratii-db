'use strict'

const express = require('express')
const compression = require('compression')
const paratiilib = require('paratii-lib')

const api = require('./api/v1')
let observer = null

require('./db')

const app = express()
startServer('address')

function startServer (registry) {
  // Overlooking Blockchain obSERVER
  observer = require('./observer')(paratiilib.Paratii, registry)
  observer.videoObserver.init()
  observer.userObserver.init()
  if (registry) {
    app.use(compression())
    app.use(express.json())

    app.use('/api/v1', api)

    app.listen(3000)
    console.log('listening at 3000')
  } else {
    throw Error('Registry address needed!')
  }
}

module.exports.startServer = startServer

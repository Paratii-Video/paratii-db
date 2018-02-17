'use strict'

const express = require('express')
const compression = require('compression')
const paratiilib = require('paratii-lib')

const api = require('./api/v1')
let observer = null

require('./db')

const app = express()

if (process.env.NODE_ENV === 'production') {
  start('0x0d03db78f5D0a85B1aBB3eAcF77CECe27e6F623F', 'ws://chainws.paratii.video')
} else if (process.env.NODE_ENV === 'development') {
  start(null, 'ws://localhost:8546')
}

function stop (app) {
  app.close()
}

function start (registry, provider) {
  // Overlooking Blockchain obSERVER

  let server
  if (process.env.NODE_ENV === 'production') {
    console.log('production')
    observer = require('./observer')(paratiilib.Paratii, registry, provider)
  } else {
    console.log('devel')
    console.log(registry)
    observer = require('./observer')(paratiilib.Paratii, registry, provider)
  }

  observer.videoObserver.init()
  observer.userObserver.init()
  observer.transactionObserver.init()

  app.use(compression())
  app.use(express.json())

  app.use('/api/v1', api)

  server = app.listen(3000)
  console.log('listening at 3000')

  return server
}

module.exports.start = start
module.exports.stop = stop

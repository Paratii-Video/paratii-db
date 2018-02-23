'use strict'

const express = require('express')
const compression = require('compression')
const paratiilib = require('paratii-lib')
const api = require('./api/v1')
const helper = require('./helper')

let observer = null

require('./db')

const app = express()

if (process.env.NODE_ENV === 'production') {
  start('0x0d03db78f5D0a85B1aBB3eAcF77CECe27e6F623F', 'ws://chainws.paratii.video')
} else if (process.env.NODE_ENV === 'development') {
  const registryFilename = require('/tmp/registry.json')
  const registryAddress = registryFilename.registryAddress

  start(registryAddress, 'ws://localhost:8546')
} else if (process.env.NODE_ENV === 'test') {
  // start(null, 'ws://localhost:8546')
}

function stop (app) {
  app.close()
}

function start (registry, provider, testlib) {
  // Overlooking Blockchain obSERVER
  helper.wellcomeLogo()

  let server
  if (process.env.NODE_ENV === 'production') {
    observer = require('./observer')(paratiilib.Paratii, registry, provider)
  } else {
    observer = require('./observer')(paratiilib.Paratii, registry, provider, testlib)
  }

  observer.videoObserver.init()
  observer.userObserver.init()
  observer.transactionObserver.init()
  observer.voucherObserver.init()
  app.use(compression())
  app.use(express.json())
  app.use('/api/v1', api)

  const port = 3000
  server = app.listen(port)

  helper.envParams(registry, provider, port)

  return server
}

module.exports.start = start
module.exports.stop = stop

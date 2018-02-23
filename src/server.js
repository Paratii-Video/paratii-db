'use strict'

const express = require('express')
const compression = require('compression')
const paratiilib = require('paratii-lib')
const registryFilename = require('/tmp/registry.json')

const api = require('./api/v1')
let observer = null

require('./db')

const app = express()
const registryAddress = registryFilename.registryAddress

if (process.env.NODE_ENV === 'production') {
  start('0x48063E31cDecd17E8a50Cd0e71086695D9a80aED', 'ws://chainws.paratii.video')
} else if (process.env.NODE_ENV === 'development') {
  console.log(registryAddress)
  start(registryAddress, 'ws://localhost:8546')
}

function stop (app) {
  app.close()
}

function start (registry, provider, ipfsRepo) {
  // Overlooking Blockchain obSERVER
  console.log('run')
  let server
  if (process.env.NODE_ENV === 'production') {
    console.log('production')
    observer = require('./observer')(paratiilib.Paratii, registry, provider)
  } else {
    console.log('devel')
    console.log(registry)
    observer = require('./observer')(paratiilib.Paratii, registry, provider, ipfsRepo)
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

'use strict'

require('dotenv').load()
const express = require('express')
const compression = require('compression')
const paratiilib = require('paratii-js')
const api = require('./api/v1')
const helper = require('./helper')
const dbConfiguration = require('../dbconfig.json')

let observer = null

require('./db')

const app = express()

// TODO: write better startup configuration, maybe using external configuration file
if (process.env.NODE_ENV === 'development') {
  //
  const registryFilename = require('/tmp/registry.json')
  const registryAddress = registryFilename.registryAddress
  start(registryAddress, dbConfiguration[process.env.NODE_ENV].provider)
} else if (process.env.NODE_ENV === 'staging' || process.env.NODE_ENV === 'production') {
  start(dbConfiguration[process.env.NODE_ENV].registry, dbConfiguration[process.env.NODE_ENV].provider)
} else if (process.env.NODE_ENV === 'docker-development') {
  const registryFilename = require('/tmp/registry.json')
  const registryAddress = registryFilename.registryAddress
  dbConfiguration[process.env.NODE_ENV].provider = 'ws://' + process.env.LOCAL_IP + ':8546'
  start(registryAddress, dbConfiguration[process.env.NODE_ENV].provider)
}

/**
 * Stop the server
 * @param  {Object} app instances of the server
 */
function stop (app) {
  app.close()
}

/**
 * Start the server
 * @param  {String} registry is the Paratii Registry Contract address
 * @param  {String} provider is the address of the NODE_ENV
 * @param  {Object} testlib  provided if Paratii Observer is testing
 * @return {Object}          the server instance
 */
function start (registry, provider, testlib, mongoUrl) {
  // Overlooking Blockchain obSERVER
  helper.wellcomeLogo()

  let server
  if (process.env.NODE_ENV === 'production') {
    observer = require('./observer')(paratiilib.Paratii, registry, provider)
  } else {
    observer = require('./observer')(paratiilib.Paratii, registry, provider, testlib)
  }

  // Inizializing observers
  observer.videoObserver.init({})
  observer.userObserver.init({})
  observer.transactionObserver.init({})
  observer.voucherObserver.init({})
  observer.applicationObserver.init({})
  observer.distributorObserver.init({})

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

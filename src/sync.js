'use strict'

const paratiilib = require('paratii-lib')
const helper = require('./helper')
const Models = require('./models')
const Video = Models.video
const Transaction = Models.transaction
const Application = Models.application
const dbConfiguration = require('../dbconfig.json')

let observer = null

require('./db')

// TODO: write better startup configuration, maybe using external configuration file
if (process.env.NODE_ENV === 'development') {
  //
	const registryFilename = require('/tmp/registry.json')
	const registryAddress = registryFilename.registryAddress

	start(registryAddress, dbConfiguration[process.env.NODE_ENV].provider)
} else if (process.env.NODE_ENV === 'staging' || process.env.NODE_ENV === 'production') {
	start(dbConfiguration[process.env.NODE_ENV].registry, dbConfiguration[process.env.NODE_ENV].provider)
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
function start (registry, provider, testlib) {
  // Overlooking Blockchain obSERVER
	helper.wellcomeSyncLogo()

	let server
	if (process.env.NODE_ENV === 'production') {
		observer = require('./observer')(paratiilib.Paratii, registry, provider)
	} else {
		observer = require('./observer')(paratiilib.Paratii, registry, provider, testlib)
	}

	Video.findLastBlockNumber().then(function (res) {
    // Inizializing observers for sync
		observer.videoObserver.init({fromBlock: res})
	})

	Transaction.findLastBlockNumber().then(function (res) {
    // Inizializing observers for sync
		observer.transactionObserver.init({fromBlock: res})
	})
	Application.findLastBlockNumber().then(function (res) {
    // Inizializing observers for sync
		observer.applicationObserver.init({fromBlock: res})
	})

	helper.envParams(registry, provider)

	return server
}

module.exports.start = start
module.exports.stop = stop

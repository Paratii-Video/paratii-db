'use strict'
const dbConfiguration = require('../dbconfig.json')

var dbm
var type
var seed

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate
  type = dbm.dataType
  seed = seedLink
}

exports.up = async function(db) {
  const paratiilib = require('paratii-js')
  let paratii = new paratiilib.Paratii({
    eth: {provider: dbConfiguration[process.env.NODE_ENV].provider}
  })
  let videos = await db._run('find', 'videos')
  for(let i in videos){
    var listingHash = paratii.eth.web3.utils.soliditySha3(videos[i]._id)
    await db._run('update', 'videos', { query: { _id: videos[i]._id}, update: {$set: {'listingHash': listingHash}}, options: {}})
  }
}

exports.down = async function(db) {
  await db._run('update', 'videos', { query: { }, update: {$unset: {'listingHash': 1}}, options: { multi:true}})

}

exports._meta = {
  'version': 1
}

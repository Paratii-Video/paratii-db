/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const DBMigrate = require('db-migrate')
const paratiilib = require('paratii-js')
const accounts = require('./data/accounts')
const Video = require('../src/models').video

// getting an instance of dbmigrate

chai.use(dirtyChai)

describe('🐦 Paratii-db Migration', function (done) {
  let dbm = DBMigrate.getInstance(true)
  let server
  let app

  before(async () => {
    let paratii

    paratii = await new paratiilib.Paratii({
      account: {
        address: accounts[0].publicKey,
        privateKey: accounts[0].privateKey
      },
      eth: {
        provider: 'ws://localhost:8546'
      }
    })
    const contract = await paratii.eth.deployContracts()
    server = require('../src/server')
    app = server.start(contract.Registry.options.address, 'ws://localhost:8546', paratii)
    await dbm.reset('test')
  })

  after(() => {
    server.stop(app)
  })

  it('Paratii-db should run a migration "up" if needed', function (done) {
    dbm.up(1, 'test').then(function () {
      Video.find({newfield: 'check'}).exec().then(function (videos) {
        if (videos.length > 0) {
          done()
        }
      })
    })
  })
  it('Paratii-db should run a migration "down" if needed', function (done) {
    dbm.down(1, 'test').then(function () {
      Video.find({newfield: 'check'}).exec().then(function (videos) {
        if (videos.length === 0) {
          done()
        }
      })
    })
  })
})

/* eslint-env mocha */
'use strict'

const chai = require('chai')
const paratiilib = require('paratii-js')
const dirtyChai = require('dirty-chai')
const accounts = require('./data/accounts')
const expect = chai.expect

const assert = chai.assert
chai.use(dirtyChai)
const Challenge = require('../src/models').challenge
const challenges = require('./data/challenges')

describe('🎭 Paratii-db Challenge Model Spec', function (done) {
  let paratii
  let server
  let app

  before(async () => {
    Challenge.remove({})

    paratii = await new paratiilib.Paratii({
      eth: {
        provider: 'http://localhost:8545/rpc/'
      },
      account: {
        address: accounts[0].publicKey,
        privateKey: accounts[0].privateKey
      }
    })
    const contract = await paratii.eth.deployContracts()
    server = require('../src/server')
    app = server.start(contract.Registry.options.address)
  })

  after(() => {
    server.stop(app)
  })

  it('Should be able to insert 1 challenge and get it back.', (done) => {
    Challenge.upsert(challenges[0], (err, item) => {
      if (err) return done(err)
      assert.isOk(item)
      done()
    })
  })

  it('Should be able to insert multiple challenges.', (done) => {
    Challenge.bulkUpsert(challenges, (err, item) => {
      if (err) return done(err)
      assert.isOk(item)
      Challenge.ensureIndexes(done)
    })
  })

  it('Search challenges by challenger and get results back', (done) => {
    Challenge.search({challenger: '0x2'}, (err, result) => {
      if (err) return done(err)
      assert.isOk(result)
      expect(result.results).to.have.lengthOf(1)
      done()
    })
  })
})

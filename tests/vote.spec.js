/* eslint-env mocha */
'use strict'

const chai = require('chai')
const paratiilib = require('paratii-js')
const dirtyChai = require('dirty-chai')
const accounts = require('./data/accounts')
const expect = chai.expect

const assert = chai.assert
chai.use(dirtyChai)
const Vote = require('../src/models').vote
const votes = require('./data/votes')

describe('☑ Paratii-db Vote Model Spec', function (done) {
  let paratii
  let server
  let app

  before(async () => {
    Vote.remove({})

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

  it('Should be able to insert 1 vote and get it back.', (done) => {
    Vote.upsert(votes[0], (err, vote) => {
      if (err) return done(err)
      assert.isOk(vote)
      done()
    })
  })

  it('Should be able to insert multiple votes.', (done) => {
    Vote.bulkUpsert(votes, (err, vote) => {
      if (err) return done(err)
      assert.isOk(vote)
      Vote.ensureIndexes(done)
    })
  })

  it('Search votes by voter and get results back', (done) => {
    Vote.search({voter: '0x2'}, (err, result) => {
      if (err) return done(err)
      assert.isOk(result)
      expect(result.results).to.have.lengthOf(2)
      done()
    })
  })

  it('Search votes by voter and pollID get results back', (done) => {
    Vote.search({voter: '0x2', pollID: '0x1'}, (err, result) => {
      if (err) return done(err)
      assert.isOk(result)
      expect(result.results).to.have.lengthOf(1)
      done()
    })
  })
})

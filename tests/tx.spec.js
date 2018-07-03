/* eslint-env mocha */
'use strict'

const chai = require('chai')
const paratiilib = require('paratii-js')
const dirtyChai = require('dirty-chai')
const accounts = require('./data/accounts')
const expect = chai.expect

const assert = chai.assert
chai.use(dirtyChai)
const Transaction = require('../src/models').transaction

const transactions = require('./data/transactions')

describe('# Paratii-db TX Model Spec', function (done) {
  let paratii
  let server
  let app

  before(async () => {
    await Transaction.collection.drop()
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

  it('should be able to insert 1 tx and get it back.', (done) => {
    Transaction.upsert(transactions[0], (err, vid) => {
      if (err) return done(err)
      assert.isOk(vid)
      done()
    })
  })

  it('should be able to insert multiple txs.', (done) => {
    Transaction.bulkUpsert(transactions, (err, success) => {
      if (err) return done(err)
      assert.isOk(success)
      Transaction.ensureIndexes(done)
    })
  })

  it('search transactions by description and get results back', (done) => {
    Transaction.search({keyword: 'descriptiontarget'}, (err, result) => {
      if (err) return done(err)
      assert.isOk(result)
      expect(result.results).to.have.lengthOf(1)
      done()
    })
  })
  it('search transactions by address and get results back', (done) => {
    Transaction.search({keyword: '0xa99dBd162ad5E1601E8d8B20703e5A3bA5c00Be7'}, (err, result) => {
      if (err) return done(err)
      assert.isOk(result)
      expect(result.results).to.have.lengthOf(2)
      done()
    })
  })
  it('search transactions by address and get results back, but just one', (done) => {
    Transaction.search({keyword: '0xa99dBd162ad5E1601E8d8B20703e5A3bA5c00Be7', limit: 1, offset: 0}, (err, result) => {
      if (err) return done(err)
      assert.isOk(result)
      expect(result.results).to.have.lengthOf(1)
      done()
    })
  })
})

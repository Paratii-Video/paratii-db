/* eslint-env mocha */
'use strict'

const chai = require('chai')
const paratiilib = require('paratii-js')
const dirtyChai = require('dirty-chai')
const accounts = require('./data/accounts')
const expect = chai.expect

const assert = chai.assert
chai.use(dirtyChai)
const User = require('../src/models').user

const users = require('./data/users')

describe('🙌 Paratii-db User Model Spec', function (done) {
  let paratii
  let server
  let app

  before(async () => {
    User.remove({})

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

  it('Should be able to insert 1 user and get it back.', (done) => {
    User.upsert(users[0], (err, vid) => {
      if (err) return done(err)
      assert.isOk(vid)
      done()
    })
  })

  it('Should be able to insert multiple users.', (done) => {
    User.bulkUpsert(users, (err, user) => {
      if (err) return done(err)
      assert.isOk(user)
      User.ensureIndexes(done)
    })
  })

  it('Search users by name and get results back', (done) => {
    User.search({keyword: 'Gino'}, (err, result) => {
      if (err) return done(err)
      assert.isOk(result)
      expect(result.results).to.have.lengthOf(2)
      done()
    })
  })
  it('Search users by email and get results back', (done) => {
    User.search({keyword: '/emailtarget/'}, (err, result) => {
      if (err) return done(err)
      assert.isOk(result)
      expect(result.results).to.have.lengthOf(2)
      done()
    })
  })
  it('Search users by email and get results back, but just one', (done) => {
    User.search({keyword: '/emailtarget/', limit: 1, offset: 1}, (err, result) => {
      if (err) return done(err)
      assert.isOk(result)
      expect(result.results).to.have.lengthOf(1)
      done()
    })
  })
})

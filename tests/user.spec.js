/* eslint-env mocha */
'use strict'

const chai = require('chai')
const paratiilib = require('paratii-lib')
const dirtyChai = require('dirty-chai')
const accounts = require('./data/accounts')

const assert = chai.assert
chai.use(dirtyChai)
const User = require('../src/models').user

const users = require('./data/users')

describe('# Parartii-db User Model Spec', function (done) {
  let paratii

  before(async () => {
    paratii = await new paratiilib.Paratii({
      provider: 'http://localhost:8545/rpc/',
      address: accounts[0].publicKey,
      privateKey: accounts[0].privateKey
    })
    const contract = await paratii.eth.deployContracts()
    const server = require('../src/server')
    setTimeout(() => {
      server.start(contract.Registry.options.address)
      done()
    }, 1000)
  })

  it('should be able to insert 1 user and get it back.', (done) => {
    User.upsert(users[0], (err, vid) => {
      if (err) return done(err)
      assert.isOk(vid)
      done()
    })
  })
})

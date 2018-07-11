/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
// const accounts = require('./data/accounts')
const users = require('./data/users')
const transactions = require('./data/transactions')
const votes = require('./data/votes')
const accounts = require('./data/accounts')

const videos = require('./data/fixtures')
const fetch = require('isomorphic-fetch')

const assert = chai.assert
chai.use(dirtyChai)
const User = require('../src/models').user
const Video = require('../src/models').video
const Transaction = require('../src/models').transaction
const Vote = require('../src/models').vote
const baseurl = 'http://localhost:3000/'
const apiVersion = 'api/v1/'
const videoApi = 'videos/'
const userApi = 'users/'
const txApi = 'transactions/'
const voteApi = 'votes/'
const paratiilib = require('paratii-js')
const request = require('request')

describe('🐝 Paratii-db API', function () {
  let paratii
  let app
  let server
  before(async () => {
    Video.remove({})
    User.remove({})
    Transaction.remove({})
    Video.bulkUpsert(videos, (err, success) => {
      if (err) throw err
    })
    User.bulkUpsert(users, (err, success) => {
      if (err) throw err
    })
    Transaction.bulkUpsert(transactions, (err, success) => {
      if (err) throw err
    })
    Vote.bulkUpsert(votes, (err, success) => {
      if (err) throw err
    })

    paratii = await new paratiilib.Paratii({
      account: {
        address: accounts[0].publicKey,
        privateKey: accounts[0].privateKey
      }

    })

    const contract = await paratii.eth.deployContracts()
    server = require('../src/server')
    app = server.start(contract.Registry.options.address, 'ws://localhost:8546', paratii)
  })

  after(() => {
    server.stop(app)
  })

  it('GET videos/:id/related should return related videos', (done) => {
    const videoId = 'QmNZS5J3LS1tMEVEP3tz3jyd2LXUEjkYJHyWSuwUvHDaRJ'
    let check = false
    fetch(baseurl + apiVersion + videoApi + videoId + '/related', {
      method: 'get'
    }).then(function (response) {
      return response.json()
    }).then(function (data) {
      check = data.length > 1
      assert.equal(check, true)
      done()
    })
  })
  it('GET videos/:id should return a video', (done) => {
    const videoId = 'QmNZS5J3LS1tMEVEP3tz3jyd2LXUEjkYJHyWSuwUvHDaRJ'
    let check = false

    fetch(baseurl + apiVersion + videoApi + videoId, {
      method: 'get'
    }).then(function (response) {
      return response.json()
    }).then(function (data) {
      check = data.id === videoId
      assert.equal(check, true)
      done()
    })
  })
  it('GET videos/ should return some videos', (done) => {
    let check = false
    fetch(baseurl + apiVersion + videoApi, {
      method: 'get'
    }).then(function (response) {
      return response.json()
    }).then(function (data) {
      check = data.results.length > 1
      assert.equal(check, true)
      done()
    })
  })
  it('GET videos/?keyword=keyword should search for videos indexed with "keyword"', (done) => {
    let check = false
    let keyword = 'The mathematician who cracked'
    const matchId = 'QmNZS5J3LS1tMEVEP3tz3jyd2LXUEjkYJHyWSuwUvHDaRJ'

    fetch(baseurl + apiVersion + videoApi + '?keyword=' + keyword, {
      method: 'get'
    }).then(function (response) {
      return response.json()
    }).then(function (data) {
      check = data.results[0].id === matchId
      assert.equal(check, true)
      done()
    })
  })

  it('GET users/:id should return a user', (done) => {
    const userId = '0xa99dBd162ad5E1601E8d8B20703e5A3bA5c00Be7'
    let check = false

    fetch(baseurl + apiVersion + userApi + userId, {
      method: 'get'
    }).then(function (response) {
      return response.json()
    }).then(function (data) {
      check = data._id === userId
      assert.equal(check, true)
      done()
    })
  })
  it('POST users/:id should save a user', (done) => {
    const userId = accounts[0].publicKey
    const email = 'sanappa@strallo.lasca'
    const hashedEmail = paratii.eth.web3.utils.soliditySha3(email)

    paratii.eth.distributor.signMessage(email).then(function (signedMessage) {
      const body = {
        email: email,
        hashedEmail: hashedEmail,
        signedEmail: signedMessage,
        whosigned: accounts[0].publicKey
      }

      request({
        url: baseurl + apiVersion + userApi + userId,
        method: 'POST',
        json: true,
        body: body
      }, function (error, response, body) {
        if (error) {
          throw error
        } else {
          assert.equal(response.body.email, email)
          done()
        }
      })
    })
  })

  it('GET users/:id/videos should return user\'s videos', (done) => {
    const userId = '0x9e2d04eef5b16CFfB4328Ddd027B55736407B275'
    let check = false

    fetch(baseurl + apiVersion + userApi + userId + '/videos', {
      method: 'get'
    }).then(function (response) {
      return response.json()
    }).then(function (data) {
      check = data.length > 1
      assert.equal(check, true)
      done()
    })
  })
  it('GET transactions/:id should return a transaction', (done) => {
    const userId = '0x9e2d04eef5b16CFfB4328Ddd027B55736407B275'
    let check = false

    fetch(baseurl + apiVersion + txApi + userId, {
      method: 'get'
    }).then(function (response) {
      return response.json()
    }).then(function (data) {
      check = data[0].from === userId || data[0].to === userId
      assert.equal(check, true)
      done()
    })
  })
  it('GET transactions/ should return some transactions', (done) => {
    let check = false

    fetch(baseurl + apiVersion + txApi, {
      method: 'get'
    }).then(function (response) {
      return response.json()
    }).then(function (data) {
      check = data.length > 1
      assert.equal(check, true)
      done()
    })
  })
  it('GET votes/:id should return a vote', (done) => {
    const voteID = '1'
    let check = false

    fetch(baseurl + apiVersion + voteApi + voteID, {
      method: 'get'
    }).then(function (response) {
      return response.json()
    }).then(function (data) {
      check = data.id === voteID
      assert.equal(check, true)
      done()
    })
  })
  it('GET votes/ should return some transactions', (done) => {
    let check = false

    fetch(baseurl + apiVersion + voteApi, {
      method: 'get'
    }).then(function (response) {
      return response.json()
    }).then(function (data) {
      check = data.results.length > 1
      assert.equal(check, true)
      done()
    })
  })
})

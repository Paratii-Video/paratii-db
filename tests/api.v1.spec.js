/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
// const accounts = require('./data/accounts')
const users = require('./data/users')
const transactions = require('./data/transactions')
const accounts = require('./data/accounts')

const videos = require('./data/fixtures')
const fetch = require('isomorphic-fetch')

const assert = chai.assert
chai.use(dirtyChai)
const User = require('../src/models').user
const Video = require('../src/models').video
const Transaction = require('../src/models').transaction
const baseurl = 'http://localhost:3000/'
const apiVersion = 'api/v1/'
const videoApi = 'videos/'
const userApi = 'users/'
const txApi = 'transactions/'
const paratiilib = require('paratii-lib')

describe('# Paratii-api', function () {
  let paratii
  let app
  let server
  before(async () => {
    Video.bulkUpsert(videos, (err, success) => {
      if (err) throw err
    })
    User.bulkUpsert(users, (err, success) => {
      if (err) throw err
    })
    Transaction.bulkUpsert(transactions, (err, success) => {
      if (err) throw err
    })

    paratii = await new paratiilib.Paratii({
      address: accounts[0].publicKey,
      privateKey: accounts[0].privateKey
    })
    const contract = await paratii.eth.deployContracts()
    server = require('../src/server')
    app = server.start(contract.Registry.options.address)
  })
  after(() => {
    server.stop(app)
  })
  it('api videos/:id/related should work as expected', async () => {
    const videoId = 'QmNZS5J3LS1tMEVEP3tz3jyd2LXUEjkYJHyWSuwUvHDaRJ'
    let check = false
    let videos = await fetch(baseurl + apiVersion + videoApi + videoId + '/related', {
      method: 'get'
    }).then(function (response) {
      return response.json()
    })
    check = videos.length > 1
    assert.equal(check, true)
  })
  it('api videos/:id should work as expected', async () => {
    const videoId = 'QmNZS5J3LS1tMEVEP3tz3jyd2LXUEjkYJHyWSuwUvHDaRJ'
    let check = false
    let videos = await fetch(baseurl + apiVersion + videoApi + videoId, {
      method: 'get'
    }).then(function (response) {
      return response.json()
    })
    check = videos._id === videoId
    assert.equal(check, true)
  })
  it('api videos/ should work as expected', async () => {
    let check = false
    let videos = await fetch(baseurl + apiVersion + videoApi, {
      method: 'get'
    }).then(function (response) {
      return response.json()
    })
    check = videos.length > 1
    assert.equal(check, true)
  })
  it('api videos/?s=keyword should work as expected', async () => {
    let check = false
    let keyword = 'The mathematician who cracked'
    const matchId = 'QmNZS5J3LS1tMEVEP3tz3jyd2LXUEjkYJHyWSuwUvHDaRJ'

    let videos = await fetch(baseurl + apiVersion + videoApi + '?s=' + keyword, {
      method: 'get'
    }).then(function (response) {
      return response.json()
    })

    check = videos[0]._id === matchId
    assert.equal(check, true)
  })
  it('api users/:id should work as expected', async () => {
    const userId = '0xa99dBd162ad5E1601E8d8B20703e5A3bA5c00Be7'
    let check = false

    let user = await fetch(baseurl + apiVersion + userApi + userId, {
      method: 'get'
    }).then(function (response) {
      return response.json()
    })
    check = user._id === userId
    assert.equal(check, true)
  })
  it('api users/:id/video should work as expected', async () => {
    const userId = '0xa99dBd162ad5E1601E8d8B20703e5A3bA5c00Be7'
    let check = false

    let videos = await fetch(baseurl + apiVersion + userApi + userId + '/video', {
      method: 'get'
    }).then(function (response) {
      return response.json()
    })
    check = videos.length > 1
    assert.equal(check, true)
  })
  it('api transactions/:id should work as expected', async () => {
    const userId = '0x9e2d04eef5b16CFfB4328Ddd027B55736407B275'
    let check = false

    let txs = await fetch(baseurl + apiVersion + txApi + userId, {
      method: 'get'
    }).then(function (response) {
      return response.json()
    })
    check = txs[0].from === userId || txs[0].to === userId
    assert.equal(check, true)
  })
  it('api transactions/ should work as expected', async () => {
    let check = false

    let txs = await fetch(baseurl + apiVersion + txApi, {
      method: 'get'
    }).then(function (response) {
      return response.json()
    })
    check = txs.length > 1
    assert.equal(check, true)
  })
})

/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const paratiilib = require('paratii-lib')
const accounts = require('./data/accounts')
const assert = chai.assert
const Video = require('../src/models').video
const waitUntil = require('wait-until')
// const expect = chai.expect
chai.use(dirtyChai)

describe('# Paratii-db Observer', function (done) {
  let paratii

  before(async () => {
    paratii = await new paratiilib.Paratii({
      provider: 'http://localhost:8545/rpc/',
      address: accounts[0].publicKey,
      privateKey: accounts[0].privateKey
    })
    paratii.eth.web3.setProvider('ws://localhost:8546')
    const contract = await paratii.eth.deployContracts()
    const server = require('../src/server')

    server.start(contract.Registry.options.address)
  })

  it('paratii lib okness', async function (done) {
    assert.isOk(paratii)
    done()
  })

  it('subscription to Create Video events should work as expected', function (done) {
    let creator = accounts[1].publicKey
    let price = 3 * 10 ** 18
    let ipfsHash = 'xyz'
    let ipfsData = 'zzz'
    let number = Math.random() // 0.9394456857981651
    var videoId = number.toString(36).substr(2, 9)
    // not so elegant, it would be better to wait for server, observer, api ecc.
    sleep(2000).then(function () {
      paratii.eth.vids.create({
        id: videoId,
        price: price,
        owner: creator,
        ipfsHash: ipfsHash,
        ipfsData: ipfsData
      })

      waitUntil()
      .interval(500)
      .times(5)
      .condition(function (cb) {
        let condition = false
        Video.findOne({_id: videoId}).exec().then(function (video) {
          if (video) {
            condition = (video._id === videoId)
            cb(condition)
          }
        })
      })
      .done(function (result) {
        assert.equal(true, result)
        done()
      })
    })

    function sleep (ms) {
      return new Promise(resolve => setTimeout(resolve, ms))
    }
  })
  it('subscription to Remove Video events should work as expected', function (done) {
    let creator = accounts[1].publicKey
    let price = 3 * 10 ** 18
    let ipfsHash = 'xyz'
    let ipfsData = 'zzz'
    let number = Math.random() // 0.9394456857981651
    var videoId = number.toString(36).substr(2, 9)
    // not so elegant, it would be better to wait for server, observer, api ecc.
    sleep(2000).then(function () {
      paratii.eth.vids.create({
        id: videoId,
        price: price,
        owner: creator,
        ipfsHash: ipfsHash,
        ipfsData: ipfsData
      })

      waitUntil()
      .interval(500)
      .times(5)
      .condition(function (cb) {
        let condition = false
        Video.findOne({_id: videoId}).exec().then(function (video) {
          if (video) {
            condition = (video._id === videoId)
            cb(condition)
          }
        })
      })
      .done(function (result) {
        assert.equal(true, result)
        done()
      })
    })

    function sleep (ms) {
      return new Promise(resolve => setTimeout(resolve, ms))
    }
  })
})

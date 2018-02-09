/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const paratiilib = require('paratii-lib')
const accounts = require('./data/accounts')
const assert = chai.assert
const Video = require('../src/models').video
const User = require('../src/models').user
const waitUntil = require('wait-until')
// const expect = chai.expect
chai.use(dirtyChai)

describe('# Paratii-db Observer', function (done) {
  let paratii
  before(async () => {
    paratii = await new paratiilib.Paratii({
      address: accounts[0].publicKey,
      privateKey: accounts[0].privateKey
    })
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
    let number = Math.random()
    let videoId = number.toString(36).substr(2, 9)
    // not so elegant, it would be better to wait for server, observer, api ecc.
    sleep(1000).then(function () {
      paratii.eth.vids.create({
        id: videoId,
        price: price,
        owner: creator,
        ipfsHash: ipfsHash,
        ipfsData: ipfsData
      })

      waitUntil()
      .interval(1000)
      .times(10)
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
        console.log('create video')
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
    let number = Math.random()
    let videoId = number.toString(36).substr(2, 9)
    // not so elegant, it would be better to wait for server, observer, api ecc.

    sleep(3000).then(function () {
      paratii.eth.vids.create({
        id: videoId,
        price: price,
        owner: creator,
        ipfsHash: ipfsHash,
        ipfsData: ipfsData
      }).then(function () {
        sleep(1000).then(function () {
          paratii.eth.vids.delete(videoId)

          waitUntil()
          .interval(500)
          .times(5)
          .condition(function (cb) {
            let condition = false
            Video.findOne({_id: videoId}, function (err, video) {
              if (err) {
                throw err
              }

              if (video == null) {
                condition = true
                cb(condition)
              }
            })
            // cb(condition)
          })
          .done(function (result) {
            assert.equal(true, result)
            console.log('remove video')
            done()
          })
        })
      })
    })

    function sleep (ms) {
      return new Promise(resolve => setTimeout(resolve, ms))
    }
  })

  it('subscription to Create User events should work as expected', function (done) {
    let userId = accounts[1].publicKey
    let userData = {
      id: userId,
      name: 'Humbert Humbert',
      email: 'humbert@humbert.ru',
      ipfsHash: 'some-hash'
    }

    // not so elegant, it would be better to wait for server, observer, api ecc.
    sleep(1000).then(function () {
      paratii.eth.users.create(userData)

      waitUntil()
      .interval(500)
      .times(5)
      .condition(function (cb) {
        let condition = false
        User.findOne({_id: userId}).exec().then(function (user) {
          if (user) {
            condition = (user._id === userId)
            cb(condition)
          }
        })
      })
      .done(function (result) {
        assert.equal(true, result)
        console.log('create user')
        done()
      })
    })

    function sleep (ms) {
      return new Promise(resolve => setTimeout(resolve, ms))
    }
  })

  it('subscription to Remove User events should work as expected', function (done) {
    let userId = accounts[0].publicKey
    let userData = {
      id: userId,
      name: 'Humbert Humbert',
      email: 'humbert@humbert.ru',
      ipfsHash: 'some-hash'
    }

    // not so elegant, it would be better to wait for server, observer, api ecc.
    sleep(1000).then(function () {
      paratii.eth.users.create(userData).then(function () {
        sleep(1000).then(function () {
          paratii.eth.users.delete(userId)

          waitUntil()
          .interval(500)
          .times(5)
          .condition(function (cb) {
            let condition = false
            User.findOne({_id: userId}, function (err, user) {
              if (err) {
                throw err
              }

              if (user == null) {
                condition = true
                cb(condition)
              }
            })
            // cb(condition)
          })
          .done(function (result) {
            assert.equal(true, result)
            console.log('remove user')
            done()
          })
        })
      })
    })

    function sleep (ms) {
      return new Promise(resolve => setTimeout(resolve, ms))
    }
  })
  it('subscription to Tranfer PTI events should work as expected', function (done) {
    let beneficiary = '0xDbC8232Bd8DEfCbc034a0303dd3f0Cf41d1a55Cf'
    let amount = paratii.eth.web3.utils.toWei('4', 'ether')

    sleep(1000).then(function () {
      paratii.eth.transfer(beneficiary, amount, 'PTI')
      sleep(1000).then(function () {
        done()
      })
    })

    function sleep (ms) {
      return new Promise(resolve => setTimeout(resolve, ms))
    }
  })
  it('subscription to Tranfer ETH events should work as expected', function (done) {
    let beneficiary = '0xDbC8232Bd8DEfCbc034a0303dd3f0Cf41d1a55Cf'
    let amount = paratii.eth.web3.utils.toWei('4', 'ether')
    let description = 'thanks for all the fish'

    sleep(1000).then(function () {
      paratii.eth.transfer(beneficiary, amount, 'ETH', description)

      sleep(1000).then(function () {
        done()
      })
    })
    function sleep (ms) {
      return new Promise(resolve => setTimeout(resolve, ms))
    }
  })
})

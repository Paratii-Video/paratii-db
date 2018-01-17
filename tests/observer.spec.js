/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const Paratii = require('paratii-lib').Paratii
const accounts = require('./data/accounts')
const assert = chai.assert

// const assert = chai.assert
// const expect = chai.expect
chai.use(dirtyChai)

describe('# Paratii-db Observer', function () {
  let paratii
  beforeEach(async function () {
    paratii = await new Paratii({
      provider: 'http://localhost:8545',
      address: accounts[0].publicKey,
      privateKey: accounts[0].privateKey
    })
    await paratii.eth.deployContracts()
    paratii.eth.web3.setProvider('ws://localhost:8546')
  })

  it('paratii lib okness', async function () {
    assert.isOk(paratii)
  })

  it('subscription to Create Video events should work as expected', function (done) {
    let creator = accounts[1].publicKey
    let price = 3 * 10 ** 18
    let ipfsHash = 'xyz'
    let ipfsData = 'zzz'
    let videoId = 'some-id'

    paratii.eth.events.addListener('CreateVideo', function (log) {
      const receivedVideoId = log.returnValues.videoId
      assert.equal(videoId, receivedVideoId)
      done()
    })

    paratii.eth.vids.create({
      id: videoId,
      price: price,
      owner: creator,
      ipfsHash: ipfsHash,
      ipfsData: ipfsData
    })
  })

  it('subscription to Create User events should work as expected', function (done) {
    let userId = accounts[1].publicKey
    let userData = {
      id: userId,
      name: 'Humbert Humbert',
      email: 'humbert@humbert.ru',
      ipfsHash: 'some-hash'
    }

    paratii.eth.events.addListener('CreateUser', function (log) {
      const receivedVideoId = log.returnValues._address
      assert.equal(userData.id, receivedVideoId)
      done()
    })

    paratii.eth.users.create(userData)
  })
})

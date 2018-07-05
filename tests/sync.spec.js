/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const paratiilib = require('paratii-js')
const accounts = require('./data/accounts')
const assert = chai.assert
const Video = require('../src/models').video
const User = require('../src/models').user
const Transaction = require('../src/models').transaction
const Application = require('../src/models').application
const utils = require('./utils.js')

chai.use(dirtyChai)

describe('♻ Sync util', function (done) {
  let paratii
  let sync
  let app
  let contract

  before(async () => {
    paratii = await new paratiilib.Paratii({
      account: {
        address: accounts[0].publicKey,
        privateKey: accounts[0].privateKey
      },
      eth: {
        provider: 'ws://localhost:8546'
      }
    })

    await Video.collection.drop()
    await User.collection.drop()
    await Transaction.collection.drop()
    await Application.collection.drop()

    contract = await paratii.eth.deployContracts()
    sync = require('../src/sync')
    let token = await paratii.eth.getContract('ParatiiToken')
    let distributor = await paratii.eth.getContract('PTIDistributor')
    await token.methods.transfer(distributor.options.address, 2 * 10 ** 18).send()
  })

  it('Sync must work properly', function (done) {
    // CREATE SOME VIDEO
    let creator = accounts[0].publicKey
    let price = 3 * 10 ** 18
    let ipfsHash = 'xyz'
    let number = Math.random()
    let videoId = number.toString(36).substr(2, 9)
    Video.findLastBlockNumber().then(function (currentBlock) {
      paratii.vids.create({
        id: videoId,
        price: price,
        owner: creator,
        ipfsHash: ipfsHash
      }).then(function () {
        app = sync.start(contract.Registry.options.address, 'ws://localhost:8546', paratii)
        utils.sleep(3000).then(function () {
          Video.findLastBlockNumber().then(function (newBlock) {
            assert.notEqual(newBlock, currentBlock)
            sync.stop(app)
            done()
          })
        })
      })
    })
  })
})

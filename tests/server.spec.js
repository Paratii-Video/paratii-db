/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const paratiilib = require('paratii-js')
const accounts = require('./data/accounts')
const assert = chai.assert
const Video = require('../src/models').video
// TODO: implement sync for other collections
// const User = require('../src/models').user
// const Transaction = require('../src/models').transaction
// const Voucher = require('../src/models').voucher
// const Application = require('../src/models').application
const utils = require('./utils.js')

chai.use(dirtyChai)

describe('🚑 Paratii-db server', function (done) {
  let paratii
  let server
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

    contract = await paratii.eth.deployContracts()
    server = require('../src/server')
    let token = await paratii.eth.getContract('ParatiiToken')
    let distributor = await paratii.eth.getContract('PTIDistributor')
    let vouchers = await paratii.eth.getContract('Vouchers')
    await token.methods.transfer(vouchers.options.address, 2 * 10 ** 18).send()
    await token.methods.transfer(distributor.options.address, 2 * 10 ** 18).send()
  })

  it('Fill in missing blocks must work properly', function (done) {
    // CREATE SOME VIDEO
    let creator = accounts[0].publicKey
    let price = 3 * 10 ** 18
    let ipfsHash = 'xyz'
    let number = Math.random()
    let videoId = number.toString(36).substr(2, 9)
    let cBlock
    Video.findLastBlockNumber().then(function (currentBlock) {
      cBlock = currentBlock
      paratii.vids.create({
        id: number.toString(36).substr(2, 9),
        price: price,
        owner: creator,
        ipfsHash: ipfsHash
      }).then(
        function (vid) {
          utils.sleep(3000).then(function () {
            number = Math.random()
            videoId = number.toString(36).substr(2, 9)

            paratii.vids.create({
              id: videoId,
              price: price,
              owner: creator,
              ipfsHash: ipfsHash
            }).then(function () {
              number = Math.random()
              videoId = number.toString(36).substr(2, 9)

              paratii.vids.create({
                id: videoId,
                price: price,
                owner: creator,
                ipfsHash: ipfsHash
              }).then(
                function (vid) {
                  console.log('restarting server')
                  app = server.start(contract.Registry.options.address, 'ws://localhost:8546', paratii)
                  utils.sleep(3000).then(function () {
                    Video.findLastBlockNumber().then(function (newBlock) {
                      assert.notEqual(newBlock, cBlock)
                      server.stop(app)

                      done()
                    })
                  })
                })
            })
          })
        })
    })
  })
})

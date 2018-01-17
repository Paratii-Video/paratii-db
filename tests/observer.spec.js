/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const paratiilib = require('paratii-lib')
const accounts = require('./data/accounts')
const assert = chai.assert
const Video = require('../src/models').video
// const assert = chai.assert
// const expect = chai.expect
chai.use(dirtyChai)

describe('# Paratii-db Observer', function () {
  let paratii
  before(async () => {
    paratii = await new paratiilib.Paratii({
      provider: 'http://localhost:8545/rpc/',
      address: accounts[0].publicKey,
      privateKey: accounts[0].privateKey
    })
    paratii.eth.web3.setProvider('ws://localhost:8546')
    const contract = await paratii.eth.deployContracts()
    console.log(contract.Registry.options.address)
    require('../src/server').start(contract.Registry.options.address)
  })

  it('paratii lib okness', async function () {
    assert.isOk(paratii)
  })

  it('subscription to Create Video events should work as expected', function (done) {
    let creator = accounts[1].publicKey
    let price = 3 * 10 ** 18
    let ipfsHash = 'xyz'
    let ipfsData = 'zzz'
    let number = Math.random() // 0.9394456857981651
    var videoId = number.toString(36).substr(2, 9)

    paratii.eth.vids.create({
      id: videoId,
      price: price,
      owner: creator,
      ipfsHash: ipfsHash,
      ipfsData: ipfsData
    })

    setTimeout(() => {
      Video.findOne({_id: videoId}, (err, video) => {
        if (err) {
          throw err
        } else {
          assert.equal(video._id, videoId)
          done()
        }
      })
    }, 3000)
  })
})

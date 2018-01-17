/* eslint-env mocha */
'use strict'

const chai = require('chai')
const paratiilib = require('paratii-lib')
const dirtyChai = require('dirty-chai')
const accounts = require('./data/accounts')

const assert = chai.assert
const expect = chai.expect
chai.use(dirtyChai)
const Video = require('../src/models').video

const fixtures = require('./data/fixtures')

describe('# Parartii-db Video Model Spec', function () {
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
      server.startServer(contract.Registry.options.address)
    }, 1000)
  })

  it('should be able to insert 1 video and get it back.', (done) => {
    Video.upsert(fixtures[0], (err, vid) => {
      if (err) return done(err)
      assert.isOk(vid)
      done()
    })
  })

  it('should be able to insert multiple videos.', (done) => {
    Video.bulkUpsert(fixtures, (err, success) => {
      if (err) return done(err)
      assert.isOk(success)
      done()
    })
  })

  it('get a sample of 6 videos', (done) => {
    Video.getRelated('QmNhyQjsFW2Tvuz7CFwDTBPo3dfBQ3S4StEpfUZPSpK9FY', (err, result) => {
      if (err) return done(err)
      assert.isOk(result)
      expect(result).to.have.lengthOf(6)
      done()
    })
  })

  it('search videos and get results back', (done) => {
    Video.search('Jim Simons', (err, result) => {
      if (err) return done(err)
      assert.isOk(result)
      expect(result).to.have.lengthOf(1)
      // console.log('found related videos', result)
      done()
    })
  })
})

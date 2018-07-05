/* eslint-env mocha */
'use strict'

const chai = require('chai')
const paratiilib = require('paratii-js')
const dirtyChai = require('dirty-chai')
const accounts = require('./data/accounts')
const users = require('./data/users')

const assert = chai.assert
const expect = chai.expect
chai.use(dirtyChai)
const Video = require('../src/models').video

const fixtures = require('./data/fixtures')

describe('📼 Paratii-db Video Model Spec', function (done) {
  let paratii
  let server
  let app

  before(async () => {
    await Video.collection.drop()
    paratii = await new paratiilib.Paratii({
      eth: {
        provider: 'http://localhost:8545/rpc/'
      },
      account: {
        address: accounts[0].publicKey,
        privateKey: accounts[0].privateKey
      }
    })
    const contract = await paratii.eth.deployContracts()
    server = require('../src/server')
    app = server.start(contract.Registry.options.address)
  })

  after(() => {
    server.stop(app)
  })

  it('Should be able to insert 1 video and get it back.', (done) => {
    Video.upsert(fixtures[0], (err, vid) => {
      if (err) return done(err)
      assert.isOk(vid)
      done()
    })
  })

  it('Should be able to insert multiple videos.', (done) => {
    Video.bulkUpsert(fixtures, (err, success) => {
      if (err) return done(err)
      assert.isOk(success)
      Video.ensureIndexes(done)
    })
  })

  it('Get a sample of 6 videos', (done) => {
    Video.getRelated('QmNhyQjsFW2Tvuz7CFwDTBPo3dfBQ3S4StEpfUZPSpK9FY', (err, result) => {
      if (err) return done(err)
      assert.isOk(result)
      expect(result).to.have.lengthOf(6)
      done()
    })
  })

  it('Search staked videos', (done) => {
    Video.search({ staked: 'true' }, (err, result) => {
      if (err) return done(err)
      assert.isOk(result)
      expect(result.results).to.have.lengthOf(3)
      done()
    })
  })
  it('Search not staked videos', (done) => {
    Video.search({ staked: 'false' }, (err, result) => {
      if (err) return done(err)
      assert.isOk(result)
      expect(result.results).to.have.lengthOf(51)
      done()
    })
  })
  it('Search any videos', (done) => {
    Video.search({}, (err, result) => {
      if (err) return done(err)
      assert.isOk(result)
      expect(result.results).to.have.lengthOf(54)
      done()
    })
  })

  it('Search videos by owner and get results back', (done) => {
    Video.search({
      keyword: '0x9e2d04eef5b16CFfB4328Ddd027B55736407B275'
    }, (err, result) => {
      if (err) return done(err)
      assert.isOk(result)
      expect(result.results).to.have.lengthOf(3)
      expect(result.total).to.equal(3)
      done()
    })
  })

  it('Search videos by no results keyword and get no results back', (done) => {
    Video.search({
      keyword: 'sanappa'
    }, (err, result) => {
      if (err) return done(err)
      assert.isOk(result)
      expect(result.results).to.have.lengthOf(0)
      expect(result.total).to.equal(0)
      done()
    })
  })

  it('Search videos by "tagtarget" and get results back', (done) => {
    Video.search({
      keyword: 'tagtarget'
    }, (err, result) => {
      if (err) return done(err)
      assert.isOk(result)
      expect(result.results).to.have.lengthOf(1)
      done()
    })
  })

  it('Search videos by "titletarget" and get results back', (done) => {
    Video.search({
      keyword: 'titletarget'
    }, (err, result) => {
      if (err) return done(err)
      assert.isOk(result)
      expect(result.results).to.have.lengthOf(1)
      done()
    })
  })
  it('Search videos by "descriptiontarget" and get results back', (done) => {
    Video.search({
      keyword: 'descriptiontarget'
    }, (err, result) => {
      if (err) return done(err)
      assert.isOk(result)
      expect(result.results).to.have.lengthOf(2)
      done()
    })
  })
  it('Search videos by uploader address and get results back', (done) => {
    Video.search({
      keyword: '0xa99dBd162ad5E1601E8d8B20703e5A3bA5c00Be7'
    }, (err, result) => {
      if (err) return done(err)
      assert.isOk(result)
      expect(result.results).to.have.lengthOf(1)
      done()
    })
  })
  it('Search videos by uploader name and get results back', (done) => {
    Video.search({
      keyword: 'uploadernametarget'
    }, (err, result) => {
      if (err) return done(err)
      assert.isOk(result)
      expect(result.results).to.have.lengthOf(2)
      done()
    })
  })
  it('Search videos by uploader name and get results back, but just one', (done) => {
    Video.search({
      keyword: 'uploadernametarget',
      limit: 1,
      offset: 1
    }, (err, result) => {
      if (err) return done(err)
      assert.isOk(result)
      expect(result.results).to.have.lengthOf(1)
      done()
    })
  })
  it('Search videos by owner address and a title and get results back', (done) => {
    Video.search({
      keyword: 'uploadernametarget',
      owner: '0xe19678107410951a9ed1f6906ba4c913eb0e44d4'
    }, (err, result) => {
      if (err) return done(err)
      assert.isOk(result)
      expect(result.results).to.have.lengthOf(1)
      done()
    })
  })

  it('Update/create username should update related video', (done) => {
    Video.find({owner: users[4]}, function (err, result) {
      if (err) {
        throw err
      }
      const videosToUpdate = result.length
      const newUser = 'newusername'
      users[4].name = newUser
      Video.updateUsername(users[4], function (err, videosUpdated) {
        if (err) {
          throw err
        }
        assert(videosToUpdate, videosUpdated.n)
        done()
      })
    })
  })
})

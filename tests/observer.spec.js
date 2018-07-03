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
const Voucher = require('../src/models').voucher
const Application = require('../src/models').application
const waitUntil = require('wait-until')

chai.use(dirtyChai)

describe('# Paratii-db Observer', function (done) {
  let paratii
  let server
  let app

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

    const contract = await paratii.eth.deployContracts()
    server = require('../src/server')
    let token = await paratii.eth.getContract('ParatiiToken')
    let distributor = await paratii.eth.getContract('PTIDistributor')
    let vouchers = await paratii.eth.getContract('Vouchers')
    await token.methods.transfer(vouchers.options.address, 2 * 10 ** 18).send()
    await token.methods.transfer(distributor.options.address, 2 * 10 ** 18).send()

    app = server.start(contract.Registry.options.address, 'ws://localhost:8546', paratii)
  })

  after(() => {
    server.stop(app)
  })

  it('paratii lib okness', async function (done) {
    assert.isOk(paratii)
    done()
  })

  it('subscription to Create Video events should work as expected', function (done) {
    let creator = accounts[0].publicKey
    let price = 3 * 10 ** 18
    let ipfsHash = 'xyz'
    // let ipfsData = 'zzz'
    let number = Math.random()
    let videoId = number.toString(36).substr(2, 9)

    sleep(3000).then(async function () {
      await paratii.vids.create({
        id: videoId,
        price: price,
        owner: creator,
        ipfsHash: ipfsHash
      })

      waitUntil()
      .interval(1000)
      .times(40)
      .condition(function (cb) {
        let condition = false
        Video.findOne({_id: videoId}).exec().then(function (video) {
          if (video) {
            condition = (video.id === videoId)
            cb(condition)
          } else {
            cb(condition)
          }
        })
      })
      .done(function (result) {
        if (result) {
          assert.equal(true, result)
          done()
        }
      })
    })

    function sleep (ms) {
      return new Promise(resolve => setTimeout(resolve, ms))
    }
  })

  it('subscription to Remove Video events should work as expected', function (done) {
    let creator = accounts[0].publicKey
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
        sleep(3000).then(function () {
          paratii.eth.vids.delete(videoId)

          waitUntil()
          .interval(500)
          .times(40)
          .condition(function (cb) {
            let condition = false
            Video.findOne({_id: videoId}, function (err, video) {
              if (err) {
                throw err
              }

              if (video == null) {
                condition = true
                cb(condition)
              } else {
                condition = false
                cb(condition)
              }
            })
            // cb(condition)
          })
          .done(function (result) {
            assert.equal(true, result)
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
    let userId = accounts[0].publicKey
    let userData = {
      id: userId,
      name: 'Humbert Humbert',
      email: 'humbert@humbert.ru',
      ipfsData: 'some-hash'
    }

    // not so elegant, it would be better to wait for server, observer, api ecc.
    sleep(1000).then(function () {
      paratii.eth.users.create(userData)

      waitUntil()
      .interval(500)
      .times(40)
      .condition(function (cb) {
        let condition = false
        User.findOne({_id: userId}).exec().then(function (user) {
          if (user) {
            condition = (user._id === userId)
            cb(condition)
          } else {
            condition = false
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

  it('subscription to Remove User events should work as expected', function (done) {
    let userId = accounts[0].publicKey
    let userData = {
      id: userId,
      name: 'Humbert Humbert',
      email: 'humbert@humbert.ru',
      ipfsData: 'some-hash'
    }

    // not so elegant, it would be better to wait for server, observer, api ecc.
    sleep(1000).then(function () {
      paratii.eth.users.create(userData).then(function (user) {
        sleep(1000).then(function () {
          paratii.eth.users.delete(userId)

          waitUntil()
          .interval(500)
          .times(40)
          .condition(function (cb) {
            let condition = false
            User.findOne({_id: userId}, function (err, user) {
              if (err) {
                throw err
              }

              if (user == null) {
                condition = true
                cb(condition)
              } else {
                condition = false
                cb(condition)
              }
            })
            // cb(condition)
          })
          .done(function (result) {
            assert.equal(true, result)
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
      paratii.eth.transfer(beneficiary, amount, 'PTI').then(function (tx) {
        let txHash = tx.transactfindOneionHash

        waitUntil()
        .interval(500)
        .times(40)
        .condition(function (cb) {
          let condition = false
          Transaction.findOne({_id: txHash}).exec().then(function (tx) {
            if (tx) {
              condition = true
              cb(condition)
            } else {
              condition = false
              cb(condition)
            }
          })
          // cb(condition)
        })
        .done(function (result) {
          assert.equal(true, result)
          done()
        })
      })
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
      paratii.eth.transfer(beneficiary, amount, 'ETH', description).then(function (tx) {
        let txHash = tx.transactfindOneionHash

        waitUntil()
        .interval(500)
        .times(40)
        .condition(function (cb) {
          let condition = false
          Transaction.findOne({_id: txHash}).exec().then(function (tx) {
            if (tx) {
              condition = true
              cb(condition)
            } else {
              condition = false
              cb(condition)
            }
          })
          // cb(condition)
        })
        .done(function (result) {
          assert.equal(true, result)
          done()
        })
      })
      sleep(1000).then(function () {
        done()
      })
    })

    function sleep (ms) {
      return new Promise(resolve => setTimeout(resolve, ms))
    }
  })

  it('subscription to Create Voucher events should work as expected', function (done) {
    let voucher = {
      voucherCode: 'FISHFORFEE42',
      amount: 42
    }

    // let duration = '01:45'
    // not so elegant, it would be better to wait for server, observer, api ecc.
    sleep(1000).then(function () {
      paratii.eth.vouchers.create(voucher).then(function (hashedVoucher) {
        console.log(hashedVoucher)
        waitUntil()
        .interval(1000)
        .times(40)
        .condition(function (cb) {
          let condition = false
          Voucher.findOne({_id: hashedVoucher}).exec().then(function (vou) {
            if (vou) {
              condition = (hashedVoucher === vou._id)
              cb(condition)
            } else {
              cb(condition)
            }
          })
        })
        .done(function (result) {
          if (result) {
            assert.equal(true, result)
            done()
          }
        })
      })
    })

    function sleep (ms) {
      return new Promise(resolve => setTimeout(resolve, ms))
    }
  })
  it('subscription to Create Voucher events should work as expected', function (done) {
    let voucher = {
      voucherCode: 'FISHFORFEE42',
      amount: 42
    }

    // let duration = '01:45'
    // not so elegant, it would be better to wait for server, observer, api ecc.
    sleep(2000).then(function () {
      paratii.eth.vouchers.redeem(voucher.voucherCode).then(function (hashedVoucher) {
        waitUntil()
        .interval(1000)
        .times(40)
        .condition(function (cb) {
          let condition = false
          Voucher.findOne({voucherCode: voucher.voucherCode}).exec().then(function (vou) {
            if (vou) {
              condition = (voucher.voucherCode === vou.voucherCode)
              cb(condition)
            } else {
              cb(condition)
            }
          })
        })
        .done(function (result) {
          if (result) {
            assert.equal(true, result)
            done()
          }
        })
      })
    })

    function sleep (ms) {
      return new Promise(resolve => setTimeout(resolve, ms))
    }
  })
  it('subscription to Application events should work as expected', function (done) {
    let amount = 5
    amount = '' + paratii.eth.web3.utils.toWei(amount.toString())
    let videoId = 'some-vide-id'

    // let duration = '01:45'
    // not so elegant, it would be better to wait for server, observer, api ecc.
    sleep(2000).then(function () {
      paratii.eth.tcrPlaceholder.checkEligiblityAndApply(videoId, amount).then(function (application) {
        waitUntil()
        .interval(2000)
        .times(40)
        .condition(function (cb) {
          let condition = false
          Application.findOne({_id: videoId}).exec().then(function (app) {
            if (app) {
              condition = ('' + app.deposit === amount)
              cb(condition)
            } else {
              cb(condition)
            }
          })
        })
        .done(function (result) {
          if (result) {
            assert.equal(true, result)
            done()
          }
        })
      })
    })

    function sleep (ms) {
      return new Promise(resolve => setTimeout(resolve, ms))
    }
  })

  it('subscription to Application events should set video as staked', function (done) {
    let creator = accounts[0].publicKey
    let amount = 5
    amount = '' + paratii.eth.web3.utils.toWei(amount.toString())
    let price = 3 * 10 ** 18
    let ipfsHash = 'xyz'
    let number = Math.random()
    let videoId = number.toString(36).substr(2, 9)
    // let duration = '01:45'
    // not so elegant, it would be better to wait for server, observer, api ecc.
    sleep(1000).then(function () {
      paratii.vids.create({
        id: videoId,
        price: price,
        owner: creator,
        ipfsHash: ipfsHash
        // ipfsData: ipfsData
        // duration
      })
      waitUntil()
      .interval(1000)
      .times(40)
      .condition(function (cb) {
        let condition = false

        Video.findOne({_id: videoId}).exec().then(function (video) {
          if (video) {
            condition = (video.id === videoId)
            cb(condition)
          } else {
            cb(condition)
          }
        })
      })
      .done(function (result) {
        if (result) {
          assert.equal(true, result)

          paratii.eth.tcrPlaceholder.checkEligiblityAndApply(videoId, amount).then(function (application) {
            waitUntil()
            .interval(1000)
            .times(40)
            .condition(function (cb) {
              let condition = false
              Video.findOne({_id: videoId}).exec().then(function (video) {
                if (video) {
                  condition = (video.staked !== undefined)
                  cb(condition)
                } else {
                  cb(condition)
                }
              })
            })
            .done(function (result) {
              if (result) {
                assert.equal(true, result)
                done()
              }
            })
          })
        }
      })
    })

    function sleep (ms) {
      return new Promise(resolve => setTimeout(resolve, ms))
    }
  })
  it('subscription to Disitribute events for email_verification reason should work as expected', function (done) {
    const amount = 5 ** 18
    const reason = 'email_verification'
    const salt = paratii.eth.web3.utils.sha3('' + Date.now())
    const owner = accounts[0].publicKey
    const address1 = '0xa99dBd162ad5E1601E8d8B20703e5A3bA5c00Be7'

    let userData = {
      id: address1,
      name: 'Humbert Humbert',
      email: 'humbert@humbert.ru',
      ipfsData: 'some-hash'
    }
    // let duration = '01:45'
    // not so elegant, it would be better to wait for server, observer, api ecc.
    sleep(1000).then(function () {
      paratii.eth.distributor.generateSignature(address1, amount, salt, reason, owner).then(function (signature) {
        let v = signature.v
        let r = signature.r
        let s = signature.s

        paratii.eth.users.create(userData).then(function (user) {
          paratii.eth.distributor.distribute({address: address1, amount, salt, reason, v, r, s}).then(function (distribute) {
            waitUntil()
            .interval(1000)
            .times(40)
            .condition(function (cb) {
              let condition = false
              User.findOne({_id: address1}).exec().then(function (user) {
                if (user) {
                  condition = (user.emailIsVerified !== undefined)
                  cb(condition)
                } else {
                  cb(condition)
                }
              })
            })
            .done(function (result) {
              if (result) {
                assert.equal(true, result)
                done()
              }
            })
          })
        })
      })
    })

    function sleep (ms) {
      return new Promise(resolve => setTimeout(resolve, ms))
    }
  })

  it('subscription to Create User events should update with a fresh username all related video', function (done) {
    let userId = accounts[0].publicKey
    let userData = {
      id: userId,
      name: 'Humbert Humbert',
      email: 'humbert@humbert.ru',
      ipfsData: 'some-hash'
    }

    // not so elegant, it would be better to wait for server, observer, api ecc.
    sleep(1000).then(function () {
      paratii.eth.users.create(userData)

      waitUntil()
      .interval(500)
      .times(40)
      .condition(function (cb) {
        let condition = false
        User.findOne({_id: userId}).exec().then(function (user) {
          if (user) {
            condition = (user._id === userId)
            cb(condition)
          } else {
            condition = false
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

  it('subscription to Create User should update all user videos with the new username', function (done) {
    let userId = accounts[0].publicKey
    let userData = {
      id: userId,
      name: 'newusername',
      email: 'humbert@humbert.ru',
      ipfsData: 'some-hash'
    }

    // not so elegant, it would be better to wait for server, observer, api ecc.
    sleep(1000).then(function () {
      paratii.eth.users.create(userData)

      waitUntil()
      .interval(500)
      .times(40)
      .condition(function (cb) {
        let condition = false
        Video.findOne({owner: userData.id}).exec().then(function (video) {
          if (video) {
            condition = (video.author === userData.name)
            cb(condition)
          } else {
            condition = false
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

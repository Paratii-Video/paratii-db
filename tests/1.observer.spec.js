/* eslint-env mocha */
'use strict'

// const chai = require('chai')
// const dirtyChai = require('dirty-chai')
const paratiilib = require('paratii-js')
const accounts = require('./data/accounts')
// const assert = chai.assert
const Video = require('../src/models').video
const User = require('../src/models').user
const Transaction = require('../src/models').transaction
const Voucher = require('../src/models').voucher
const Application = require('../src/models').application
const Challenge = require('../src/models').challenge
const Vote = require('../src/models').vote
const waitUntil = require('wait-until')
const utils = require('./utils.js')
const { assert } = require('chai')

// chai.use(dirtyChai)

describe('👀 Paratii-db Observer', function (done) {
  let paratii
  let server
  let app
  let videoId
  // to avoid problem with interaction with other tests
  let myPrivateKey = '0x55e23c060d7d5e836b776852772d7de52d1756fc857d0493b4374a21e03d9c18'
  // let myAddress = '0x77Db6De1baD96E52492A25e0e86480F3a0A24Ae1'

  let myPrivateKey1 = '0x0690816a7e30ab2865f81ab924e0009d092f5d4c937eb7b39070f93cf153d5c9'
  // let myAddress2 = '0x246057C676E0EBA07F645A194E99B553b8afd2ad'

  let myPrivateKey2 = '0x4fb2363a8880b279e38316b749ad163708a5dc4445e3f69fdc58475054d77601'
  // let myAddress3 = '0x7d3f3a0c7ec67675ffc8B10b1F62D10096A14829'
  //
  before(async () => {
    Challenge.remove({})
    Video.remove({})
    Vote.remove({})
    User.remove({})
    Transaction.remove({})

    paratii = await new paratiilib.Paratii({
      account: {
        address: accounts[0].publicKey,
        privateKey: accounts[0].privateKey
      },
      eth: {
        provider: 'ws://localhost:8546',
        tcrConfig: require('./data/tcrConfig.json')
      }
    })
    const contract = await paratii.eth.deployContracts()
    server = require('../src/server')
    let token = await paratii.eth.getContract('ParatiiToken')
    let distributor = await paratii.eth.getContract('PTIDistributor')
    let vouchers = await paratii.eth.getContract('Vouchers')
    let tcr = await paratii.eth.tcr.getTcrContract()
    let amountToAllowWei = paratii.eth.web3.utils.toWei('1000')
    let amountToAllowInHex = paratii.eth.web3.utils.toHex(amountToAllowWei)
    await token.methods.approve(tcr.options.address, amountToAllowInHex).send()
    await token.methods.allowance(accounts[0].publicKey, tcr.options.address).call()

    await token.methods.transfer(vouchers.options.address, 2 * 10 ** 18).send()
    await token.methods.transfer(distributor.options.address, 2 * 10 ** 18).send()

    app = server.start(contract.Registry.options.address, 'ws://localhost:8546', paratii)
  })

  after(() => {
    server.stop(app)
  })

  it('Paratii-js okness', async function (done) {
    assert.isOk(paratii)
    done()
  })

  it('Subscription to CreateVideo event should save a video', function (done) {
    let creator = accounts[0].publicKey
    let price = 3 * 10 ** 18
    let ipfsHash = 'xyz'
    let number = Math.random()
    videoId = number.toString(36).substr(2, 9)

    utils.sleep(5000).then(async function () {
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
            condition = (video.id === videoId && video.listingHash === paratii.eth.web3.utils.soliditySha3(videoId))
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

  it('Subscription to CreateVideo event should update a video and set blockNumber/createBlockNumber and blockTimestamp/createBlockTimestamp properly', function (done) {
    let creator = accounts[0].publicKey
    let price = 3 * 10 ** 18
    let price2 = 2 * 10 ** 18
    let ipfsHash = 'xyz'

    // not so elegant, it would be better to wait for server, observer, api ecc.
    utils.sleep(1000).then(async function () {
      await paratii.vids.create({
        id: videoId,
        price: price,
        owner: creator,
        ipfsHash: ipfsHash
      }).then(async function () {
        await paratii.vids.create({
          id: videoId,
          price: price2,
          owner: creator,
          ipfsHash: ipfsHash
        })
        waitUntil()
        .interval(500)
        .times(40)
        .condition(function (cb) {
          let condition = false

          Video.findOne({_id: videoId}).exec().then(function (video) {
            if (video) {
              condition = (video.blockNumber > video.createBlockNumber && video.blockTimestamp > video.createBlockTimestamp)
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
    })
  })

  it('Subscription to RemoveVideo events should remove a video', function (done) {
    let creator = accounts[0].publicKey
    let price = 3 * 10 ** 18
    let ipfsHash = 'xyz'
    let ipfsData = 'zzz'
    let number = Math.random()
    let videoId = number.toString(36).substr(2, 9)
    // not so elegant, it would be better to wait for server, observer, api ecc.

    utils.sleep(3000).then(function () {
      paratii.eth.vids.create({
        id: videoId,
        price: price,
        owner: creator,
        ipfsHash: ipfsHash,
        ipfsData: ipfsData
      }).then(function () {
        utils.sleep(3000).then(function () {
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
          })
          .done(function (result) {
            assert.equal(true, result)
            done()
          })
        })
      })
    })
  })

  it('Subscription to CreateUser event should create a user', function (done) {
    let userId = accounts[0].publicKey
    let userData = {
      id: userId,
      name: 'Humbert Humbert',
      ipfsData: 'some-hash'
    }

    // not so elegant, it would be better to wait for server, observer, api ecc.
    utils.sleep(1000).then(function () {
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
  })

  it('Subscription to CreateUser event should update a user and set blockNumber/createBlockNumber and blockTimestamp/createBlockTimestamp properly', function (done) {
    let userId = accounts[0].publicKey
    let userData = {
      id: userId,
      name: 'Humbert Humbert',
      ipfsData: 'some-hash'
    }

    // not so elegant, it would be better to wait for server, observer, api ecc.
    utils.sleep(1000).then(function () {
      paratii.eth.users.create(userData).then(function () {
        userData.name = 'Updated name of beloved Humbert'
        paratii.eth.users.create(userData)
        waitUntil()
        .interval(500)
        .times(40)
        .condition(function (cb) {
          let condition = false
          User.findOne({_id: userId}).exec().then(function (user) {
            if (user) {
              condition = (user.blockNumber > user.createBlockNumber && user.blockTimestamp > user.createBlockTimestamp)
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
    })
  })

  it('Subscription to RemoveUser event should remove a user', function (done) {
    let userId = accounts[0].publicKey
    let userData = {
      id: userId,
      name: 'Humbert Humbert',
      email: 'humbert@humbert.ru',
      ipfsData: 'some-hash'
    }

    // not so elegant, it would be better to wait for server, observer, api ecc.
    utils.sleep(1000).then(function () {
      paratii.eth.users.create(userData).then(function (user) {
        utils.sleep(1000).then(function () {
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
          })
          .done(function (result) {
            assert.equal(true, result)
            done()
          })
        })
      })
    })
  })

  it('Subscription to TranferPTI event should create a new transaction', function (done) {
    let beneficiary = '0xDbC8232Bd8DEfCbc034a0303dd3f0Cf41d1a55Cf'
    let amount = paratii.eth.web3.utils.toWei('4', 'ether')

    utils.sleep(1000).then(function () {
      paratii.eth.transfer(beneficiary, amount, 'PTI').then(function (tx) {
        let txHash = tx.transactionHash

        waitUntil()
        .interval(500)
        .times(40)
        .condition(function (cb) {
          let condition = false
          Transaction.findOne({_id: txHash}).exec().then(function (tx) {
            if (tx.to === beneficiary) {
              condition = true
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
    })
  })

  it('Subscription to TranferETH event should create a new transaction', function (done) {
    let beneficiary = '0xDbC8232Bd8DEfCbc034a0303dd3f0Cf41d1a55Cf'
    let amount = paratii.eth.web3.utils.toWei('4', 'ether')
    let description = 'thanks for all the fish'

    utils.sleep(1000).then(function () {
      paratii.eth.transfer(beneficiary, amount, 'ETH', description).then(function (tx) {
        let txHash = tx.transactionHash

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
        })
        .done(function (result) {
          assert.equal(true, result)
          done()
        })
      })
    })
  })

  it('Subscription to CreateVoucher event should create a new voucher', function (done) {
    let voucher = {
      voucherCode: 'FISHFORFEE42',
      amount: 42
    }

    utils.sleep(1000).then(function () {
      paratii.eth.vouchers.create(voucher).then(function (hashedVoucher) {
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
  })
  it('Subscription to RedeemVoucher event should set a voucher as redeemed', function (done) {
    let voucher = {
      voucherCode: 'FISHFORFEE42',
      amount: 42
    }

    utils.sleep(2000).then(function () {
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
  })

  it('Subscription to Disitribute event for a email_verification reason set a user as verified', function (done) {
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
    utils.sleep(1000).then(function () {
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
  })

  it('Subscription to CreateUser event should update user\'s videos with a fresh username', function (done) {
    let userId = accounts[0].publicKey
    let userData = {
      id: userId,
      name: 'newusername',
      email: 'humbert@humbert.ru',
      ipfsData: 'some-hash'
    }

    // not so elegant, it would be better to wait for server, observer, api ecc.
    utils.sleep(1000).then(function () {
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
  })

  it('Subscription to Application event should set deposit in a video', function (done) {
    let amount = 10
    amount = '' + paratii.eth.web3.utils.toWei(amount.toString())
    let videoId = 'some-vide-id'
    let listingHash = paratii.eth.web3.utils.soliditySha3(videoId)
    // let duration = '01:45'
    // not so elegant, it would be better to wait for server, observer, api ecc.
    utils.sleep(2000).then(function () {
      paratii.eth.tcr.apply(videoId, amount).then(function (application) {
        waitUntil()
        .interval(2000)
        .times(40)
        .condition(function (cb) {
          let condition = false
          Application.findOne({_id: listingHash}).exec().then(function (app) {
            if (app) {
              condition = ('' + app.deposit === amount && app.applicant === accounts[0].publicKey)
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

  it('Subscription to Application event should set a video as staked', function (done) {
    let creator = accounts[0].publicKey
    let amount = 10
    amount = '' + paratii.eth.web3.utils.toWei(amount.toString())
    let price = 3 * 10 ** 18
    let ipfsHash = 'xyz'
    let number = Math.random()
    videoId = number.toString(36).substr(2, 9)
    let listingHash = paratii.eth.web3.utils.soliditySha3(videoId)

    // let duration = '01:45'
    // not so elegant, it would be better to wait for server, observer, api ecc.
    utils.sleep(10000).then(function () {
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
        Video.findOne({listingHash: listingHash}).exec().then(function (video) {
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
          console.log('here2')

          paratii.eth.tcr.apply(videoId, amount).then(function (application) {
            waitUntil()
            .interval(1000)
            .times(40)
            .condition(function (cb) {
              let condition = false
              Video.findOne({listingHash: listingHash}).exec().then(function (video) {
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
  })

  it('Subscription to Challenge event should work as expected', function (done) {
    let listingHash = paratii.eth.web3.utils.soliditySha3(videoId)
    // let duration = '01:45'
    // not so elegant, it would be better to wait for server, observer, api ecc.
    utils.sleep(2000).then(function () {
      paratii.eth.tcr.startChallenge(videoId).then(function (application) {
        waitUntil()
        .interval(1000)
        .times(40)
        .condition(function (cb) {
          let condition = false
          Challenge.findOne({listingHash: listingHash}).exec().then(function (item) {
            if (item) {
              condition = (item.listingHash === listingHash && item.challenger === accounts[0].publicKey && item.voteQuorum !== undefined)
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

  it('Subscription to ChallengeFailed event should work as expected', function (done) {
    votingProcess().then(function (listingHash) {
      waitUntil()
      .interval(1000)
      .times(40)
      .condition(function (cb) {
        let condition = false
        Challenge.findOne({listingHash: listingHash}).exec().then(function (item) {
          if (item) {
            condition = (item.result === 'failed')
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

    async function votingProcess () {
      // haven't applied yet
      let amount = 10
      let salt = 420 // this gotta be some random val
      videoId = 'i-need-a-new-id3'

      await paratii.eth.tcr.apply(videoId, amount)

      const challengeID = await utils.challengeFromDifferentAccount(myPrivateKey, videoId, 40, paratii)

      await utils.voteFromDifferentAccount(myPrivateKey, challengeID, 1, salt, 1, paratii)

      await utils.voteFromDifferentAccount(myPrivateKey1, challengeID, 1, salt, 1, paratii)

      await utils.voteFromDifferentAccount(myPrivateKey2, challengeID, 0, salt, 1, paratii)

      let isCommitPeriodActive = await paratii.eth.tcr.commitPeriodActive(challengeID)
      assert.equal(true, isCommitPeriodActive)
      // challenge can't be resolved because we are still in commit period
      do {
        await paratii.eth.transfer(accounts[0].publicKey, 1, 'PTI')
        isCommitPeriodActive = await paratii.eth.tcr.commitPeriodActive(challengeID)
      } while (isCommitPeriodActive)

      assert.equal(false, isCommitPeriodActive)

      await utils.revealVoteFromDifferentAccount(myPrivateKey, challengeID, 1, salt, paratii)
      await utils.revealVoteFromDifferentAccount(myPrivateKey1, challengeID, 1, salt, paratii)
      await utils.revealVoteFromDifferentAccount(myPrivateKey2, challengeID, 0, salt, paratii)

      let isRevealPeriodActive
      do {
        await paratii.eth.transfer(accounts[0].publicKey, 1, 'PTI')
        isRevealPeriodActive = await paratii.eth.tcr.revealPeriodActive(challengeID)
      } while (isRevealPeriodActive)

      let isPassed = await paratii.eth.tcr.isPassed(challengeID)
      assert.isTrue(isPassed)

      let updateTx = await paratii.eth.tcr.updateStatus(videoId)
      assert.isOk(updateTx)
      assert.isOk(updateTx.events._ApplicationWhitelisted)
      assert.isOk(updateTx.events._ChallengeFailed)

      return paratii.eth.web3.utils.soliditySha3(videoId)
    }
  })
  it('Subscription to ChallengeSucceeded event should work as expected', function (done) {
    votingProcess().then(function (listingHash) {
      waitUntil()
      .interval(1000)
      .times(40)
      .condition(function (cb) {
        let condition = false
        Challenge.findOne({listingHash: listingHash}).exec().then(function (item) {
          if (item) {
            condition = (item.result === 'succeeded')
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

    async function votingProcess () {
      // haven't applied yet
      let amount = 10
      let salt = 420 // this gotta be some random val
      videoId = 'i-need-a-new-id4'

      await paratii.eth.tcr.apply(videoId, amount)
      const challengeID = await utils.challengeFromDifferentAccount(myPrivateKey, videoId, 40, paratii)
      await utils.voteFromDifferentAccount(myPrivateKey, challengeID, 0, salt, 1, paratii)
      await utils.voteFromDifferentAccount(myPrivateKey1, challengeID, 0, salt, 1, paratii)
      await utils.voteFromDifferentAccount(myPrivateKey2, challengeID, 0, salt, 1, paratii)

      let isCommitPeriodActive = await paratii.eth.tcr.commitPeriodActive(challengeID)
      assert.equal(true, isCommitPeriodActive)
      // challenge can't be resolved because we are still in commit period

      do {
        await paratii.eth.transfer(accounts[0].publicKey, 1, 'PTI')
        isCommitPeriodActive = await paratii.eth.tcr.commitPeriodActive(challengeID)
      } while (isCommitPeriodActive)

      assert.equal(false, isCommitPeriodActive)

      await utils.revealVoteFromDifferentAccount(myPrivateKey, challengeID, 0, salt, paratii)
      await utils.revealVoteFromDifferentAccount(myPrivateKey1, challengeID, 0, salt, paratii)
      await utils.revealVoteFromDifferentAccount(myPrivateKey2, challengeID, 0, salt, paratii)

      let isRevealPeriodActive
      do {
        await paratii.eth.transfer(accounts[0].publicKey, 1, 'PTI')
        isRevealPeriodActive = await paratii.eth.tcr.revealPeriodActive(challengeID)
      } while (isRevealPeriodActive)

      // let isPassed = await paratii.eth.tcr.isPassed(challengeID)
      // assert.isTrue(isPassed)
      // console.log('broke here 2')

      let updateTx = await paratii.eth.tcr.updateStatus(videoId)
      assert.isOk(updateTx)

      assert.isOk(updateTx.events._ChallengeSucceeded)

      return paratii.eth.web3.utils.soliditySha3(videoId)
    }
  })
  it('Subscription to VoteCommited and VoteRevealed events should work as expected', function (done) {
    votingProcess().then(function (challengeID) {
      waitUntil()
      .interval(1000)
      .times(40)
      .condition(function (cb) {
        let condition = false
        Vote.find({pollID: challengeID, voter: '0x77Db6De1baD96E52492A25e0e86480F3a0A24Ae1'}).exec().then(function (result) {
          console.log(result)
          if (result) {
            condition = (result.length === 1)
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

    async function votingProcess () {
      // haven't applied yet
      let amount = 10
      let salt = 420 // this gotta be some random val
      videoId = 'i-need-a-new-id5'

      await paratii.eth.tcr.apply(videoId, amount)
      const challengeID = await utils.challengeFromDifferentAccount(myPrivateKey, videoId, 40, paratii)
      await utils.voteFromDifferentAccount(myPrivateKey, challengeID, 0, salt, 1, paratii)
      await utils.voteFromDifferentAccount(myPrivateKey1, challengeID, 0, salt, 1, paratii)
      await utils.voteFromDifferentAccount(myPrivateKey2, challengeID, 0, salt, 1, paratii)

      let isCommitPeriodActive = await paratii.eth.tcr.commitPeriodActive(challengeID)
      assert.equal(true, isCommitPeriodActive)
      // challenge can't be resolved because we are still in commit period

      do {
        await paratii.eth.transfer(accounts[0].publicKey, 1, 'PTI')
        isCommitPeriodActive = await paratii.eth.tcr.commitPeriodActive(challengeID)
      } while (isCommitPeriodActive)

      assert.equal(false, isCommitPeriodActive)

      await utils.revealVoteFromDifferentAccount(myPrivateKey, challengeID, 0, salt, paratii)
      await utils.revealVoteFromDifferentAccount(myPrivateKey1, challengeID, 0, salt, paratii)
      await utils.revealVoteFromDifferentAccount(myPrivateKey2, challengeID, 0, salt, paratii)

      let isRevealPeriodActive
      do {
        await paratii.eth.transfer(accounts[0].publicKey, 1, 'PTI')
        isRevealPeriodActive = await paratii.eth.tcr.revealPeriodActive(challengeID)
      } while (isRevealPeriodActive)

      // let isPassed = await paratii.eth.tcr.isPassed(challengeID)
      // assert.isTrue(isPassed)
      // console.log('broke here 2')

      let updateTx = await paratii.eth.tcr.updateStatus(videoId)
      assert.isOk(updateTx)

      assert.isOk(updateTx.events._ChallengeSucceeded)

      return challengeID
    }
  })
})

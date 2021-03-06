/* eslint-env mocha */
'use strict'
const chai = require('chai')
const BigNumber = require('bignumber.js')

module.exports.sleep = function (ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * utility function for testing. The vote is always committed with 1 PTI
 * 1. Creates the account and adds it to the wallet
 * 2. fund the account
 * 3. gives the approval to the PLCRVoting
 * 4. creates a vote (NB it votes always with 1 wei)
 * 5. requests vote rights
 * 6. gets the previous pollID
 * 7. commits the vote
 * @param  {string} privateKey   private key of the voter
 * @param  {string} videoId      challengeID to vote on
 * @param {integer} vote         1/0
 * @param  {integer} amountToFund amount to fund the voter
 * @param  {Object} paratii      paratii instance
 * @private
 */
module.exports.voteFromDifferentAccount = async function (privateKey, challengeID, vote, salt, amountToFund, paratii) {
  let tcrPLCRVoting = await paratii.eth.tcr.getPLCRVotingContract()
  chai.assert.isOk(tcrPLCRVoting)

  // add voter account.
  let voterAccount = await paratii.eth.web3.eth.accounts.wallet.add({
    privateKey: privateKey
  })
  // index of the last added accounts
  let index = paratii.eth.web3.eth.accounts.wallet.length - 1
  chai.assert.isOk(voterAccount)
  chai.assert.isOk(paratii.eth.web3.eth.accounts.wallet[index])
  chai.assert.equal(voterAccount.address, paratii.eth.web3.eth.accounts.wallet[index].address)

  let token = await paratii.eth.getContract('ParatiiToken')
  let startingFund = new BigNumber(await token.methods.balanceOf(voterAccount.address).call())

  // fund it.
  chai.assert.isOk(token)
  let amountToTransferInWei = paratii.eth.web3.utils.toWei(amountToFund.toString())
  let transferTx = await token.methods.transfer(
    voterAccount.address,
    amountToTransferInWei
  ).send()
  chai.assert.isOk(transferTx)
  let balanceOfVoter = new BigNumber(await token.methods.balanceOf(voterAccount.address).call())
  let amount = new BigNumber(paratii.eth.web3.utils.toWei(amountToFund.toString()))
  chai.assert.equal(Number(balanceOfVoter), Number(amount.plus(startingFund)))

  // approve PLCRVoting
  let amountToVoteInWei = paratii.eth.web3.utils.toWei('1')
  let approveTx = await token.methods.approve(
    tcrPLCRVoting.options.address,
    amountToVoteInWei
  ).send({from: voterAccount.address})
  chai.assert.isOk(approveTx)
  chai.assert.isOk(approveTx.events.Approval)

  // voting process.
  // 1. create voteSaltHash
  let voteSaltHash = paratii.eth.web3.utils.soliditySha3(vote, salt)

  // 2. request voting rights as voter.
  let requestVotingRightsTx = await tcrPLCRVoting.methods.requestVotingRights(
    amountToVoteInWei
  ).send({from: voterAccount.address})

  chai.assert.isOk(requestVotingRightsTx)
  chai.assert.isOk(requestVotingRightsTx.events._VotingRightsGranted)

  // 3. getPrevious PollID
  let prevPollID = await tcrPLCRVoting.methods.getInsertPointForNumTokens(
    voterAccount.address,
    amountToVoteInWei,
    challengeID
  ).call()
  chai.assert.isOk(prevPollID)

  // 4. finally commitVote.
  let commitVoteTx = await tcrPLCRVoting.methods.commitVote(
    challengeID,
    voteSaltHash,
    amountToVoteInWei,
    prevPollID
  ).send({from: voterAccount.address})

  chai.assert.isOk(commitVoteTx)
  chai.assert.isOk(commitVoteTx.events._VoteCommitted)
}

module.exports.revealVoteFromDifferentAccount = async function (privateKey, pollID, vote, salt, paratii) {
  let tcrPLCRVoting = await paratii.eth.tcr.getPLCRVotingContract()

  // add voter account.
  let voterAccount = await paratii.eth.web3.eth.accounts.wallet.add({
    privateKey: privateKey
  })
  // index of the last added accounts
  let index = paratii.eth.web3.eth.accounts.wallet.length - 1
  chai.assert.isOk(voterAccount)
  chai.assert.isOk(paratii.eth.web3.eth.accounts.wallet[index])
  chai.assert.equal(voterAccount.address, paratii.eth.web3.eth.accounts.wallet[index].address)

  let isRevealPeriodActive = await paratii.eth.tcr.revealPeriodActive(pollID)
  chai.assert.isTrue(isRevealPeriodActive)

  let didCommit = await paratii.eth.tcr.didCommit(voterAccount.address, pollID)
  chai.assert.isTrue(didCommit)

  let didReveal = await paratii.eth.tcr.didReveal(voterAccount.address, pollID)
  chai.assert.isFalse(didReveal)

  let secretHash = paratii.eth.web3.utils.soliditySha3(vote, salt)

  let commitHash = await paratii.eth.tcr.getCommitHash(voterAccount.address, pollID)

  chai.assert.equal(secretHash, commitHash)

  let revealTx = await tcrPLCRVoting.methods.revealVote(
    pollID,
    vote,
    salt
  ).send({from: voterAccount.address})

  chai.assert.isOk(revealTx)
  chai.assert.isOk(revealTx.events._VoteRevealed)

  return revealTx
}

/**
 * utility function for testing.
 * 1. Creates the account and adds it to the wallet
 * 2. fund the account
 * 3. gives the approval to the tcr
 * 4. starts the challenge
 * @param  {string} privateKey   private key of the challenger
 * @param  {string} videoId      videoId to be challenged
 * @param  {integer} amountToFund amount to fund the challenger
 * @param  {Object} paratii      paratii instance
 * @return {Promise} that resolves in the challengeId
 * @private
 */

module.exports.challengeFromDifferentAccount = async function (privateKey, videoId, amountToFund, paratii) {
  // console.log('challengeFromDifferentAccount ', privateKey.slice(0, 6), videoId, amountToFund)
  // let contracts = await paratii.eth.getContracts()
  // console.log('contracts: ', Object.keys(contracts))

  let tcrRegistry = await paratii.eth.tcr.getTcrContract()
  chai.assert.isOk(tcrRegistry)

  // create challenger account --------------------------------------------------
  let challengerAccount = await paratii.eth.web3.eth.accounts.wallet.add({
    privateKey: privateKey
  })

  chai.assert.isOk(challengerAccount)

  let index = paratii.eth.web3.eth.accounts.wallet.length - 1

  chai.assert.equal(challengerAccount.address, paratii.eth.web3.eth.accounts.wallet[index].address)
  // console.log('private key', privateKey.slice(0, 6), 'added, index: ', index)
  let token = await paratii.eth.getContract('ParatiiToken')
  chai.assert.isOk(token)

  let startingFund = new BigNumber(await token.methods.balanceOf(challengerAccount.address).call())
  // console.log('startingFund', privateKey.slice(0, 6), startingFund.toString())

  // fund address1 of the challenger account -------------------------------------
  let amountToTransferInWei = paratii.eth.web3.utils.toWei(amountToFund.toString())
  let smallerAmountToTransferInWei = paratii.eth.web3.utils.toWei('39')
  // console.log('smallerAmountToTransferInWei: ', smallerAmountToTransferInWei.toString())
  let transferTx = await token.methods.transfer(
    challengerAccount.address,
    amountToTransferInWei
  ).send({from: paratii.eth.getAccount()})
  // console.log('transferTx: ', transferTx)
  chai.assert.isOk(transferTx)
  let balanceOfAddress1 = new BigNumber(await token.methods.balanceOf(challengerAccount.address).call())
  let amount = new BigNumber(paratii.eth.web3.utils.toWei(amountToFund.toString()))
  // console.log('amountToFund', privateKey.slice(0, 6), amountToTransferInWei.toString(), 'balance: ', balanceOfAddress1.toString())
  chai.assert.equal(Number(balanceOfAddress1), Number(amount.plus(startingFund)))
  console.log('brokes a')

  // approve the tcr to spend address1 tokens ------------------------------------
  console.log(tcrRegistry.options.address)
  console.log(smallerAmountToTransferInWei.toString())
  let approval = await token.methods.approve(
    tcrRegistry.options.address,
    smallerAmountToTransferInWei.toString()
  ).send({from: paratii.eth.web3.eth.accounts.wallet[index].address}) // send from challengerAccount
  console.log('brokes b')

  // console.log('approval ', privateKey.slice(0, 6), approval)
  chai.assert.isOk(approval)
  chai.assert.isOk(approval.events.Approval)
  console.log('brokes c')

  // start the challenge from the challenger account -----------------------------
  let challengeTx = await tcrRegistry.methods.challenge(
    paratii.eth.tcr.getHash(videoId),
    ''
  ).send({from: challengerAccount.address})
  // console.log('challengeTx: ', challengeTx)
  console.log('brokes d')

  chai.assert.isOk(challengeTx)
  chai.assert.isOk(challengeTx.events._Challenge)
  console.log(challengeTx)
  let challengeID = challengeTx.events._Challenge.returnValues.challengeID
  chai.assert.isOk(challengeID)
  // console.log('CHALLENGEID : ', challengeID)
  console.log('brokes e')
  // check that the challenge is actually from the challengerAccount and not from the default one
  let challenge = await tcrRegistry.methods.challenges(challengeID).call()
  chai.assert.equal(challengerAccount.address, challenge.challenger)
  return challengeID
}

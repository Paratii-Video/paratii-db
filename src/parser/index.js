
/**
 * Parse the video logs and ipfs MetaData as the model require
 * @param  {Object} log      the Videos contract event
 * @param  {Object} ipfsData json containing video meta data
 * @return {Object}          a video object acceptable for Videos collection
 */
module.exports.video = async function (log, ipfsData, paratii) {
  var video = {}
  // TODO: add data validator -> JOY
  video._id = log.returnValues.videoId
  video.listingHash = paratii.eth.web3.utils.soliditySha3(log.returnValues.videoId)

  // TODO: add video id to listinghash
  video.price = log.returnValues.price

  // TODO: this can be handle better with an assign
  video.title = (ipfsData) ? ipfsData.title : ''
  video.description = (ipfsData && ipfsData.description) ? ipfsData.description : ''
  video.duration = (ipfsData && ipfsData.duration) ? ipfsData.duration : ''
  video.author = (ipfsData && ipfsData.author) ? ipfsData.author : ''
  video.storageStatus = (ipfsData && ipfsData.storageStatus) ? ipfsData.storageStatus : { data: {} }
  video.transcodingStatus = (ipfsData && ipfsData.transcodingStatus) ? ipfsData.transcodingStatus : { data: {} }
  video.filesize = (ipfsData && ipfsData.filesize) ? ipfsData.filesize : ''
  video.filename = (ipfsData && ipfsData.filename) ? ipfsData.filename : ''
  video.uploadStatus = (ipfsData && ipfsData.uploadStatus) ? ipfsData.uploadStatus : { data: {} }
  video.thumbnails = (ipfsData && ipfsData.thumbnails) ? ipfsData.thumbnails : ''

  video.ipfsHash = log.returnValues.ipfsHash
  video.ipfsData = log.returnValues.ipfsData
  video.blockNumber = log.blockNumber
  let block = await paratii.eth.web3.eth.getBlock(log.blockNumber)
  video.blockTimestamp = block.timestamp
  video.ipfsHashOrig = log.returnValues.ipfsHashOrig
  video.owner = log.returnValues.owner
  video.uploader = {}
  video.uploader.address = log.returnValues.registrar
  return video
}

/**
 * Parse the user logs as the model require
 * @param  {Object} log the Users contract event
 * @return {Object}     a user object acceptable for Users collection
 */
module.exports.user = async function (log, paratii) {
  // TODO: add data validator
  var user = {}
  user._id = log.returnValues._address
  user.name = log.returnValues._name
  user.blockNumber = log.blockNumber
  let block = await paratii.eth.web3.eth.getBlock(log.blockNumber)
  user.blockTimestamp = block.timestamp
  // TODO: ignored becouse is setted directly from the POST
  // user.email = log.returnValues._email
  user.ipfsData = log.returnValues._ipfsData
  // console.log(user)

  return user
}

/**
 * Parse the transaction logs as the model require
 * @param  {Object} log the Transactions contracts event
 * @return {Object}     a transaction object acceptable for Transactions collection
 */
module.exports.tx = function (log) {
  // TODO: add data validator
  var tx = {}
  tx._id = log.transactionHash
  tx.blockNumber = log.blockNumber
  tx.event = log.event
  tx.description = log.returnValues.description
  tx.from = log.returnValues.from
  tx.logIndex = log.logIndex
  tx.to = log.returnValues.to
  tx.value = log.returnValues.value

  return tx
}

/**
 * Parse the voucher logs as the model require
 * @param  {Object} log the Vouchers contract event
 * @return {Object}     a voucher object acceptable for Vouchers collection
 */
module.exports.voucher = function (log) {
  // TODO: add data validator
  var voucher = {}
  voucher._id = log.returnValues._hashedVoucher
  voucher.amount = log.returnValues._amount
  voucher.voucherCode = log.returnValues._voucher
  voucher.claimant = log.returnValues._claimant
  return voucher
}

/**
 * Parse the application logs as the model require
 * @param  {Object} log the TCR contract event
 * @return {Object}     a tcr object acceptable for Application collection
 */
module.exports.application = function (log) {
  // TODO: add data validator
  var application = {}
  application._id = log.returnValues.listingHash
  application.deposit = log.returnValues.deposit
  application.appEndDate = log.returnValues.appEndDate
  application.blockNumber = log.blockNumber
  application.data = log.data
  application.applicant = log.returnValues.applicant
  // TODO: add blockTimestamp
  return application
}

/**
 * Parse the challenge logs as the model require
 * @param  {Object} log the TCR contract event
 * @return {Object}     a tcr object acceptable for challenge collection
 */
module.exports.challenge = async function (log, paratii) {
  // TODO: add data validator
  var challenge = {}
  challenge._id = log.returnValues.challengeID
  challenge.listingHash = log.returnValues.listingHash
  challenge.data = log.returnValues.data
  challenge.commitEndDate = log.returnValues.commitEndDate
  challenge.revealEndDate = log.returnValues.revealEndDate
  challenge.challenger = log.returnValues.challenger
  challenge.rewardPool = log.returnValues.rewardPool
  challenge.totalTokens = log.returnValues.totalTokens
  challenge.blockNumber = log.blockNumber
  let block = await paratii.eth.web3.eth.getBlock(log.blockNumber)
  challenge.commitStartDate = block.timestamp
  return challenge
}

/**
 * Parse the poll logs as the model require
 * @param  {Object} log the TCR contract event
 * @return {Object}     a tcr object acceptable for poll collection
 */
module.exports.poll = async function (log, paratii) {
  // TODO: add data validator
  var challenge = {}
  challenge._id = log.returnValues.pollID
  challenge.voteQuorum = log.returnValues.voteQuorum
  return challenge
}

/**
 * Parse the distribute logs as the model require
 * @param  {Object} log the Distribute contract event
 * @return {Object}     a distribute object acceptable for some reason
 */
module.exports.distribute = function (log) {
  // TODO: add data validator
  var distribute = {}

  distribute.toAddress = log.returnValues._toAddress
  distribute.reason = log.returnValues._reason
  return distribute
}

/**
 * Parse the vote logs as the model require
 * @param  {Object} log the vote contract event
 * @return {Object}     a vote object acceptable for some reason
 */
module.exports.vote = async function (log, paratii) {
  // TODO: add data validator
  var vote = {}
  vote.voter = log.returnValues.voter
  vote.pollID = log.returnValues.pollID
  vote.numTokens = log.returnValues.numTokens
  vote.choice = log.returnValues.choice
  let block = await paratii.eth.web3.eth.getBlock(log.blockNumber)
  if (vote.choice) {
    vote.voteRevealed = block.timestamp
  } else {
    vote.voteCommitted = block.timestamp
  }
  vote.blockNumber = log.blockNumber

  return vote
}

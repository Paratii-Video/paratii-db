
/**
 * Parse the video logs and ipfs MetaData as the model require
 * @param  {Object} log      the Videos contract event
 * @param  {Object} ipfsData json containing video meta data
 * @return {Object}          a video object acceptable for Videos collection
 */
module.exports.video = function (log, ipfsData) {
  var video = {}
  // TODO: add data validator -> JOY
  video._id = log.returnValues.videoId
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
  video.published = (ipfsData && ipfsData.published) ? ipfsData.published : ''
  video.thumbnails = (ipfsData && ipfsData.thumbnails) ? ipfsData.thumbnails : ''

  video.ipfsHash = log.returnValues.ipfsHash
  video.ipfsData = log.returnValues.ipfsData
  video.blockNumber = log.blockNumber
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
module.exports.user = function (log) {
  // TODO: add data validator
  var user = {}
  user._id = log.returnValues._address
  user.name = log.returnValues._name
  user.email = log.returnValues._email
  user.ipfsData = log.returnValues._ipfsData

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
 * Parse the voucher logs as the model require
 * @param  {Object} log the TCR contract event
 * @return {Object}     a tcr object acceptable for Application collection
 */
module.exports.application = function (log) {
  // TODO: add data validator
  var application = {}
  application._id = log.returnValues.videoId
  application.deposit = log.returnValues.deposit
  application.blockNumber = log.blockNumber
  return application
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

module.exports.video = function (log, ipfsData) {
  var video = {}
  // TODO: add a data validator
  video._id = log.returnValues.videoId
  video.price = log.returnValues.price
  video.title = (ipfsData) ? ipfsData.title : ''
  video.description = (ipfsData) ? ipfsData.description : ''
  video.duration = (ipfsData) ? ipfsData.duration : ''
  video.ipfsHash = log.returnValues.ipfsHash
  video.ipfsData = log.returnValues.ipfsData
  video.ipfsHashOrig = log.returnValues.ipfsHashOrig
  video.owner = log.returnValues.owner
  video.uploader = {}
  video.uploader.address = log.returnValues.registrar
  return video
}

module.exports.user = function (log) {
  var user = {}
  user._id = log.returnValues._address
  user.name = log.returnValues._name
  user.email = log.returnValues._email
  user.ipfsData = log.returnValues._ipfsData

  return user
}

module.exports.tx = function (log) {
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
module.exports.voucher = function (log) {
  var voucher = {}
  voucher._id = log.returnValues._hashedVoucher
  voucher.amount = log.returnValues._amount
  voucher.voucherCode = log.returnValues._voucher
  voucher.claimant = log.returnValues._claimant
  return voucher
}

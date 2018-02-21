module.exports.video = function (log, ipfsData) {
  var video = {}
  video._id = log.returnValues.videoId
  video.price = log.returnValues.price
  video.title = ipfsData.title
  video.description = ipfsData.description
  video.src = log.returnValues.ipfsHash
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

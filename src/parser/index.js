module.exports.video = function (log) {
  var video = {}
  video._id = log.returnValues.videoId
  video.price = log.returnValues.price
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
  user.ipfsHash = log.returnValues._ipfsData

  return user
}

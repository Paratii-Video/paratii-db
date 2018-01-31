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

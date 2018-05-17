
const Models = require('../models')
const parser = require('../parser')
const User = Models.user
const helper = require('../helper')

module.exports = function (paratii) {
  var module = {}

  module.init = async function (options) {
    // events hook

    /**
     * Observer and upserter for created user event
     * @param  {String} log the CreateUser event
     */
    await paratii.eth.events.addListener('Distribute', options, function (log) {
      helper.logEvents(log, '💰  Distribute Event at Distributor contract events')

      User.verify(parser.distribute(log), (err, user) => {
        if (err) {
          throw err
        }
      })
    })


    if (options.fromBlock !== undefined) {
      helper.log('|      👓  syncing 💰 Distributor contract events since the block ' + options.fromBlock)
    } else {
      helper.log('|      👓  observing at 💰 Distributor contract events')
    }
  }

  return module
}

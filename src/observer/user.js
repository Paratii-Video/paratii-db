'use strict'

const Models = require('../models')
const parser = require('../parser')
const User = Models.user

module.exports = function (paratii) {
  var module = {}
  // paratiiInstance = paratii

  module.init = async function () {
    // events hook

    await paratii.eth.events.addListener('CreateUser', function (log) {
      console.log('       🙌  CreateUser Event at Users contract events  ')
      console.log('           ####### here the log: #######              ')
      console.log('                                                      ')
      console.log('                                                      ')
      console.log('                                                      ')
      console.log(log)
      console.log('                                                      ')
      console.log('                                                      ')
      console.log('                                                      ')
      console.log('           ####### end of the log #######             ')

      User.upsert(parser.user(log), (err, user) => {
        if (err) {
          throw err
        }
      })
    })
    await paratii.eth.events.addListener('RemoveUser', function (log) {
      console.log('       🙌  Removing Event at Users contract events  ')
      console.log('           ####### here the log: #######              ')
      console.log('                                                      ')
      console.log('                                                      ')
      console.log('                                                      ')
      console.log(log)
      console.log('                                                      ')
      console.log('                                                      ')
      console.log('                                                      ')
      console.log('           ####### end of the log #######             ')
      User.delete(log.returnValues._address, (err, res) => {
        if (err) {
          throw err
        }
      })
    })

    console.log('|      👓  observing at 🙌 User contract events')
  }

  return module
}

/* eslint-env mocha */
'use strict'

module.exports.sleep = function (ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

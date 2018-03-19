'use strict'

require('dotenv').load()

module.exports = {
  mongodb: {
    url: 'mongodb://' + process.env.LOCAL_IP + '/test'
  }
}

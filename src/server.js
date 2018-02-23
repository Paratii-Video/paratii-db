'use strict'

const express = require('express')
const compression = require('compression')
const paratiilib = require('paratii-lib')

const api = require('./api/v1')
let observer = null

require('./db')

const app = express()

if (process.env.NODE_ENV === 'production') {
  start('0x48063E31cDecd17E8a50Cd0e71086695D9a80aED', 'ws://chainws.paratii.video')
} else if (process.env.NODE_ENV === 'development') {
  const registryFilename = require('/tmp/registry.json')
  const registryAddress = registryFilename.registryAddress

  start(registryAddress, 'ws://localhost:8546')
} else if (process.env.NODE_ENV === 'test') {
  // start(null, 'ws://localhost:8546')
}

function stop (app) {
  app.close()
}

function start (registry, provider, testlib) {
  // Overlooking Blockchain obSERVER

  console.log('                                                                                                              0000  0000 ')
  console.log('      0x00                                                                                             00     xxxx  0xxxx')
  console.log('      0xxxxx00                                                                                       xxxx0               ')
  console.log('      0xxxxxxxx0                        0xxx00xxxxx00      00xxxx00xxxx  0000000x0   00xxxx000xxx  0xxxxxxxxxxxxxx0 0xxx0')
  console.log('      0xxxxx00           0xxx           0xxxxxxxxxxxxx0  0xxxxxxxxxxxxx  0xxxxxxx0 0xxxxxxxxxxxxx  xxxxxxxxxxxxxxx0 0xxx0')
  console.log('      0xx00          00xxxxxx           0xxxx0    0xxxx 0xxxx0    0xxxx  0xxxxx0000xxxx0    0xxxx    xxxx0    xxxx0 0xxx0')
  console.log('                  00xxxxxxxxx           0xxx0      xxxx00xxx0      xxxx  0xxx0    0xxx0      xxxx    xxxx0    0xxx0 0xxx0')
  console.log('              00xxxxxxxxxxxxx           0xxxx0    0xxxx 0xxxx0    0xxxx  0xxx0    0xxxx0    0xxxx    0xxx0    0xxx0 0xxx0')
  console.log('           00xxxxxxxxxxxxxxxx           0xxxxxxxxxxxxx0  0xxxxxxxxxxxxx  0xxx0     0xxxxxxxxxxxxx    0xxxxxx  0xxx0 0xxx0')
  console.log('       00xxxxxxxxxxxxxxxxxxxx           0xxxx00xxxx00      0xxxxxx0xxxx  0xxx0       00xxxxx0xxxx     00xxxx  0xxx0 0xxx0')
  console.log('      0xxxxxxxxxxxxxxxxxxxx0            0xxx0                                                                            ')
  console.log('      xxxxxxxxxxxxxxxxx00               0xxx0                                                                            ')
  console.log('      xxxxxxxxxxxxxx00                  00000                                                                            ')
  console.log('      xxxxxxxxxx00                                                                                                       ')
  console.log('      xxxxxxx00                                                                                                          ')
  console.log('      xxx00                                                                                                              ')
  console.log('      00                                                                                                                 ')
  console.log('                                                                                                                         ')
  console.log('            _    _____  _____  _____  _____  _____  _____                                                                ')
  console.log('       ___ | |_ |   __||   __|| __  ||  |  ||   __|| __  |                                                               ')
  console.log('      | . || . ||__   ||   __||    -||  |  ||   __||    -|                                                               ')
  console.log('      |___||___||_____||_____||__|__| \\___/ |_____||__|__|                                                              ')
  console.log('                                                                                                                         ')
  console.log('                                                                                                                         ')
  console.log('                                                                                                                         ')

  let server
  if (process.env.NODE_ENV === 'production') {
    observer = require('./observer')(paratiilib.Paratii, registry, provider)
  } else {
    observer = require('./observer')(paratiilib.Paratii, registry, provider, testlib)
  }

  console.log('|      Paratii obSERVER running in ' + process.env.NODE_ENV + ' mode')
  console.log('|      is obSERVING the current provider:' + provider)
  console.log('|      and the Paratii Registry at:' + registry)

  observer.videoObserver.init()
  observer.userObserver.init()
  observer.transactionObserver.init()
  app.use(compression())
  app.use(express.json())
  app.use('/api/v1', api)

  const port = 3000
  server = app.listen(port)
  console.log('|      API rest interface available at ' + port)

  return server
}

module.exports.start = start
module.exports.stop = stop

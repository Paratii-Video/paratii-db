'use strict'

const express = require('express')
const compression = require('compression')
const paratiilib = require('paratii-lib')

// Overlooking Blockchain obSERVER
const observer = require('./observer')(paratiilib.Paratii)
observer.videoObserver.init()
observer.userObserver.init()

const api = require('./api/v1')
require('./db')

const app = express()
app.use(compression())
app.use(express.json())

app.use('/api/v1', api)

app.listen(3000)
console.log('listening at 3000')

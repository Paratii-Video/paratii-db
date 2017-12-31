'use strict'

const express = require('express')
const compression = require('compression')
const api = require('./api/v1')
require('./db')

const app = express()
app.use(compression())

app.use('/api/v1', api)

app.listen(3000)
console.log('listening at 3000')

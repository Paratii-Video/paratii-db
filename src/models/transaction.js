'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const TransactionSchema = new Schema({
	blockNumber: Number,
	currency: String,
	date: Date,
	description: String,
	from: String,
	hash: String,
	logIndex: Number,
	nonce: Number,
	source: String,
	to: String,
	value: Number // FIXME use BigNumber.js here <===
})

const Transaction = mongoose.model('Transaction', TransactionSchema)

module.exports = Transaction

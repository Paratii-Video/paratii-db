'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const EventSchema = new Schema({
	sender: String,
	receiver: String,
	description: String,
	senderBalance: Number, // FIXME should be bignumber.js
	receiverBalance: Number, // FIXME should be bignumber.js
	amount: Number, // FIXME should be bignumber
	createdAt: Date
})

const Event = mongoose.model('Event', EventSchema)

module.exports = Event

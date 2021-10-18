const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const eventSchema = new Schema({
	name: String,
	location: String,
	startDate: Date,
	endDate: Date
})

module.exports = mongoose.model('Event', eventSchema);
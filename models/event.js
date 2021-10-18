const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const eventSchema = new Schema({
	name: {
		type: String,
		required: true
	},
	location: {
		type: String,
		required: true,
	},
	startDate: {
		type: Date,
		required: true,
	},
	endDate: {
		type: Date,
		required: true,
	},
	creator: {
		type: Schema.Types.ObjectId,
		ref: 'User',
		required: true,
	},
	registeredUsers: [{
		type: Schema.Types.ObjectId,
		ref: 'User'
	}]
})

module.exports = mongoose.model('Event', eventSchema);
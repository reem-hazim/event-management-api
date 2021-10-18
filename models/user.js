const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const imageSchema = new Schema({
	url: String,
	filename: String,
})

const userSchema = new Schema({
	firstName: String,
	lastName: String,
	email: String,
	dob: Date,
	picture: imageSchema,
})

module.exports = mongoose.model('User', userSchema);
const mongoose = require('mongoose')
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const imageSchema = new Schema({
	url: String,
	filename: String,
})

const userSchema = new Schema({
	firstName: {
		type: String,
		required: true,
	},
	lastName: {
		type: String,
		required: true,
	},
	email: {
		type: String,
		required: true,
		unique: [true, "An account with this email is already registered. Please log in."]
	},
	dob: {
		type: Date,
		required: true,
	},
	image: imageSchema,
	token: {
		type: String,
	},
	password: {
		type: String,
		required: true
	},
	registeredEvents: [{
		type: Schema.Types.ObjectId,
		ref: 'Event',
	}]
})

// Validate user
userSchema.statics.findAndValidate = async function(email, password){
	const foundUser = await this.findOne({email});
	if(!foundUser) return false;
	const isValid = await bcrypt.compare(password, foundUser.password);
	return isValid ? foundUser : false;
}

// Encrypt Password
userSchema.pre('save', async function(next){
	this.email = this.email.toLowerCase()
	if(!this.isModified('password')) return next();
	this.password = await bcrypt.hash(this.password, 12);
	next();
})

userSchema.methods.createToken = function(){
	token_key = process.env.token_key || "hello123"
	const token = jwt.sign(
        { user_id: this._id, email:this.email },
        token_key,
        {expiresIn: "2h",}
      );
      // save user token
      this.token = token;
}

userSchema.methods.isRegistered = function(event_id){
	return registered = this.registeredEvents.some(function (event) {
    	return event.equals(event_id);
	});
}

userSchema.methods.populateUser = async function(){
	await this.populate({path: 'registeredEvents', select: 'name'})
	const {firstName, lastName, dob, email, _id, registeredEvents, token} = this
	return {_id, firstName, lastName, dob, email, registeredEvents, image:this.image.url, _id, token} 

}

module.exports = mongoose.model('User', userSchema);
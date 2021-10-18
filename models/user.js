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
	},
	dob: {
		type: Date,
		required: true,
	},
	picture: imageSchema,
	token: {
		type: String,
	},
	password: {
		type: String,
		required: true
	}
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

userSchema.methods.createToken = async function(token_key){
	const token = jwt.sign(
        { user_id: this._id, email:this.email },
        token_key,
        {
          expiresIn: "2h",
        }
      );
      // save user token
      this.token = token;
      await this.save()
}

module.exports = mongoose.model('User', userSchema);
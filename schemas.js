const Joi = require('joi')

module.exports.userSchema = Joi.object({
	firstName: Joi.string().required(),
	lastName: Joi.string().required(),
	email: Joi.string().email().required(),
	dob:Joi.date().required().max('now'),
	password: Joi.string().min(8)
		.regex(/[A-Z]/, 'upper-case')
		.regex(/[a-z]/, 'lower-case')
		.regex(/[^\w]/, 'special character').required()
})

module.exports.eventUpdateSchema = Joi.object({
	name: Joi.string(),
	location: Joi.string(),
	startDate: Joi.date().iso(),
	endDate:Joi.date().iso().min(Joi.ref('startDate'))
}).min(1)

module.exports.eventNewSchema = Joi.object({
	name: Joi.string().required(),
	location: Joi.string().required(),
	startDate: Joi.date().iso().required(),
	endDate:Joi.date().iso().min(Joi.ref('startDate')).required()
})



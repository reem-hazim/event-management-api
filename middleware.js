const jwt = require('jsonwebtoken')
const AppError = require('./utils/AppError')
const Event = require('./models/event')
const User = require('./models/user')
const wrapAsync = require('./utils/wrapAsync')
const {userSchema, eventUpdateSchema, eventNewSchema} = require('./schemas')

module.exports.verifyToken = wrapAsync(async (req, res, next) => {
  const token =
    req.headers["x-access-token"];

  if (!token) 
  	throw new AppError("A token is required for authentication", 400, "Token required")

		const decoded = jwt.verify(token, process.env.TOKEN_KEY);
		req.user = decoded;

  const user = await User.findById(req.user.user_id)

  if (user.token !== token)
  	throw new AppError("Your token is expired. Please log in again.", 400, "Token expired")
	return next();

});

module.exports.isCreator = async (req, res, next)=>{
	const user_id = req.user.user_id
	const event = await Event.findById(req.params.id)
	if(!event)
		throw new AppError("This event does not exist", 400, "Invalid event")

	if(!event.creator.equals(user_id))
		throw new AppError("You are not authorized to edit this event.", 400,"No authorization")

	return next()
}

module.exports.validateNewEvent = (req, res, next)=>{
	const {error} = eventNewSchema.validate(req.body)
	if (error){
		const msg = error.details.map(el => el.message).join(', ')
		throw new AppError(msg, 400, "Event Validation Error")
	} else
		next()
}

module.exports.validateUpdateEvent = (req, res, next)=>{
	const {error} = eventUpdateSchema.validate(req.body)
	if (error){
		const msg = error.details.map(el => el.message).join(', ')
		throw new AppError(msg, 400, "Event Validation Error")
	} else
		next()
}

module.exports.validateNewUser = (req, res, next)=>{
	const {error} = userSchema.validate(req.body)
	if (error){
		const msg = error.details.map(el => el.message).join(', ')
		throw new AppError(msg, 400, "User Validation Error")
	} else
		next()
}

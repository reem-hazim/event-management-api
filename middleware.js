const jwt = require('jsonwebtoken')
const AppError = require('./utils/AppError')
const Event = require('./models/event')
const User = require('./models/user')
const wrapAsync = require('./utils/wrapAsync')
const {userSchema, eventUpdateSchema, eventNewSchema} = require('./schemas')

module.exports.verifyToken = wrapAsync(async (req, res, next) => {
  const token =
    req.headers["x-access-token"];

  if (!token) {
    return res.status(400).send("A token is required for authentication");
  }

  try{
		const decoded = jwt.verify(token, process.env.TOKEN_KEY);
		req.user = decoded;
  } catch(error){
  	throw new AppError(error, 400)
  }

  const user = await User.findById(req.user.user_id)

  if (user.token === token)
		return next();
	else
		return res.send("Your token is expired. Please login again.")
});

module.exports.isCreator = async (req, res, next)=>{
	const user_id = req.user.user_id
	const event = await Event.findById(req.params.id)
	if(!event)
		return res.send("This event does not exist")
	if(!event.creator.equals(user_id)){
		return res.send("You are not authorized to edit this event.")
	}
	return next()
}

module.exports.validateNewEvent = (req, res, next)=>{
	const {error} = eventNewSchema.validate(req.body)
	if (error){
		const msg = error.details.map(el => el.message).join(', ')
		throw new AppError(msg, 400)
	} else
		next()
}

module.exports.validateUpdateEvent = (req, res, next)=>{
	const {error} = eventUpdateSchema.validate(req.body)
	if (error){
		const msg = error.details.map(el => el.message).join(', ')
		throw new AppError(msg, 400)
	} else
		next()
}

module.exports.validateNewUser = (req, res, next)=>{
	const {error} = userSchema.validate(req.body)
	if (error){
		const msg = error.details.map(el => el.message).join(', ')
		throw new AppError(msg, 400)
	} else
		next()
}

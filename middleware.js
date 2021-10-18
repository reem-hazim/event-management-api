const jwt = require('jsonwebtoken')
const AppError = require('./utils/AppError')
const Event = require('./models/event')

module.exports.verifyToken = (req, res, next) => {
  const token =
    req.headers["x-access-token"];

  if (!token) {
    return res.status(400).send("A token is required for authentication");
  }
  try{
	const decoded = jwt.verify(token, process.env.TOKEN_KEY);
	req.user = decoded;
	console.log(req.user)
  } catch(error){
  	throw new AppError(error, 400)
  }
	return next();
};

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
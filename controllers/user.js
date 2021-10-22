const AppError = require('../utils/AppError')
const User = require('../models/user')

module.exports.login = async (req, res, next)=>{
	const {email, password} = req.body
	let authenticatedUser = await User.findAndValidate(email, password);
	if(!authenticatedUser)
		throw new AppError("Error logging in. Please make sure you have entered the correct username and password.", 400, "Login Error")
	authenticatedUser.createToken()
	await authenticatedUser.save()
	return res.json(await authenticatedUser.populateUser())
}

module.exports.logout = async (req, res)=>{
  const user = req.user
  user.token = null
  await user.save()
	res.json({"token": req.headers["x-access-token"],
						"expired": true})
}

module.exports.register = async (req, res, next)=>{
  // check if user already exist
  const foundUser = await User.findOne({ email:req.body.email });
  if (foundUser) 
  	throw new AppError("This user already exists", 400, "User exists")

 	if (!req.file)
 		throw new AppError("An image is required.", 400, "Image Error.")
	let newUser = User(req.body)
	newUser.image = {url: req.file.path, filename: req.file.filename}
	newUser.createToken()
	await newUser.save()
	return res.json(await newUser.populateUser())
}

module.exports.getUser = async (req, res, next)=>{
	const user = req.user
	return res.json(await user.populateUser())
}
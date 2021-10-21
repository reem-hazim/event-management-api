const express = require('express')
const router = express.Router({mergeParams: true})
const User = require('../models/user')
const wrapAsync = require('../utils/wrapAsync')
const AppError = require('../utils/AppError')
const {verifyToken, validateNewUser} = require('../middleware')
const multer = require('multer')
const {storage} = require('../cloudinary')
const upload = multer({storage})


router.post('/login', wrapAsync(async (req, res, next)=>{
	const {email, password} = req.body
	let authenticatedUser = await User.findAndValidate(email, password);
	if(!authenticatedUser)
		throw new AppError("Error logging in. Please make sure you have entered the correct username and password.", 400, "Login Error")
	authenticatedUser.createToken(process.env.TOKEN_KEY)
	await authenticatedUser.save()
	return res.json(await authenticatedUser.prettyPrint())
}))

router.post('/logout', verifyToken, wrapAsync(async (req, res)=>{
  const user = await User.findById(req.user.user_id)
  user.token = null
  await user.save()
	res.json({"token": req.headers["x-access-token"],
						"expired": true})
}))

router.post('/register', upload.single('image'), validateNewUser, wrapAsync(async (req, res, next)=>{
  // check if user already exist
  const foundUser = await User.findOne({ email:req.body.email });
  if (foundUser) 
  	throw new AppError("This user already exists", 400, "User exists")

	let newUser = User(req.body)
	newUser.image = {url: req.file.path, filename: req.file.filename}
	newUser.createToken(process.env.TOKEN_KEY)
	await newUser.save()
	return res.json(await newUser.prettyPrint())
}))


module.exports = router

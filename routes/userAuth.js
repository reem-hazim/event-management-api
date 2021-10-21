const express = require('express')
const router = express.Router({mergeParams: true})
const User = require('../models/user')
const wrapAsync = require('../utils/wrapAsync')
const AppError = require('../utils/AppError')
const {verifyToken, validateNewUser} = require('../middleware')

router.post('/login', wrapAsync(async (req, res, next)=>{
	const {email, password} = req.body
	let authenticatedUser = await User.findAndValidate(email, password);
	if(authenticatedUser){
		await authenticatedUser.createToken(process.env.TOKEN_KEY)
		return res.json(authenticatedUser)
	} else {
		return res.status(400).send("Error logging in. Please make sure you have entered the correct username and password.")
	}
	
}))

router.post('/logout', verifyToken, wrapAsync(async (req, res)=>{
  const user = await User.findById(req.user.user_id)
  user.token = null
  await user.save()
	res.send("You have been logged out")
}))

router.post('/register', validateNewUser, wrapAsync(async (req, res, next)=>{
	const {firstName, lastName, email, dob, password} = req.body
  // check if user already exist
  const foundUser = await User.findOne({ email });

  if (foundUser) {
    return res.status(400).send("This user already exists");
  }

	let newUser = User({firstName, lastName, email, dob: new Date(dob), password})
	// await newUser.save()
	await newUser.createToken(process.env.TOKEN_KEY)
	return res.status(200).json(newUser)
}))


module.exports = router

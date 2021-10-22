const express = require('express')
const router = express.Router({mergeParams: true})
const User = require('../models/user')
const wrapAsync = require('../utils/wrapAsync')
const AppError = require('../utils/AppError')
const {verifyToken, validateNewUser, isUser} = require('../middleware')
const multer = require('multer')
const {storage} = require('../cloudinary')
const upload = multer({storage})
const users = require('../controllers/user')

router.post('/login', wrapAsync(users.login))

router.post('/logout', verifyToken, wrapAsync(users.logout))

router.post('/register', upload.single('image'), validateNewUser, wrapAsync(users.register))

router.get('/user/:id', verifyToken, isUser, wrapAsync(users.getUser))
module.exports = router

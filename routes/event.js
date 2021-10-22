const express = require('express')
const mongoose = require('mongoose')
const Event = require('../models/event')
const router = express.Router({mergeParams: true})
const {verifyToken, isCreator, validateNewEvent, validateUpdateEvent} = require('../middleware')
const wrapAsync = require('../utils/wrapAsync')
const User = require('../models/user')
const AppError = require('../utils/AppError')
const events = require('../controllers/event')

router.post('/:id/register', verifyToken, wrapAsync(events.register))

router.post('/:id/unregister', verifyToken, wrapAsync(events.unregister))

router.route('/:id')
	.get(wrapAsync(events.getEvent))
	.delete(verifyToken, isCreator, wrapAsync(events.deleteEvent))
	.put(verifyToken, isCreator, validateUpdateEvent, wrapAsync(events.updateEvent))

router.route('/')
	// show all events
	.get(wrapAsync(events.getEvents))
	// create new event
	.post(verifyToken, validateNewEvent, wrapAsync(events.createEvent))

module.exports = router
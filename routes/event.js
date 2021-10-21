const express = require('express')
const mongoose = require('mongoose')
const Event = require('../models/event')
const router = express.Router({mergeParams: true})
const {verifyToken, isCreator, validateNewEvent, validateUpdateEvent} = require('../middleware')
const wrapAsync = require('../utils/wrapAsync')
const User = require('../models/user')
const AppError = require('../utils/AppError')

router.post('/:id/register', verifyToken, async (req, res)=>{
	const {id:event_id} = req.params;
	const event = await Event.findById(event_id)
	const user = await User.findById(req.user.user_id)
	if (!event)
		throw new AppError("This is not a valid event ID.", 400, "Invalid Event ID")
	if(!user)
		throw new AppError("This is not a valid User ID.", 400, "Invalid User ID")

	// check if user is already registered
	if (user.isRegistered(event._id))
		throw new AppError("You are already registered in this event.", 400, "Already registered.")
	
	event.registeredUsers.push(user._id)
	await event.save()
	user.registeredEvents.push(event._id)
	await user.save()
	return res.json(await user.populateUser())
})

router.post('/:id/unregister', verifyToken, wrapAsync(async (req, res)=>{
	const {id:event_id} = req.params;
	const {user_id} = req.user
	const user = await User.findById(user_id)
	if (!user.isRegistered(event_id))
		throw new AppError("You are not registered in this event.", 400, "Not registered.")
	
	const updatedUser = await User.findByIdAndUpdate(user_id, { $pull: {registeredEvents: event_id }}, {new:true, useFindAndModify: false})
	await Event.findByIdAndUpdate(event_id, { $pull: {registeredUsers: user_id }}, {new:true, useFindAndModify: false})
	return res.json(await updatedUser.prettyPrint())
}))

router.route('/:id')
	.get(wrapAsync(async (req, res)=> {
		const event = await Event.findById(req.params.id)
		res.json(await event.populateEvent())
	}))
	.delete(verifyToken, isCreator, wrapAsync(async (req, res)=>{
		const deletedEvent = await Event.findByIdAndDelete(req.params.id);
		res.json(deletedEvent)
	}))
	.put(verifyToken, isCreator, validateUpdateEvent, wrapAsync(async (req, res)=>{
		const event = await Event.findByIdAndUpdate(req.params.id, {...req.body}, {new:true});
		res.json(event)
	}))

router.route('/')
	// show all events
	.get(wrapAsync(async (req, res)=>{
		const events = await Event
								.find()
								.populate({path: 'creator', select: ['firstName', 'lastName', 'email']})
								.populate({path: 'registeredUsers', select: ['firstName', 'lastName', 'email']})
		res.json(events)
	}))
	// create new event
	.post(verifyToken, validateNewEvent, wrapAsync(async (req, res)=>{
		const {name, startDate, endDate, location} = req.body
		const event = new Event({name, startDate, endDate, location})
		event.creator = req.user.user_id
		await event.save()
		return res.json(await event.populateEvent())
	}))

module.exports = router
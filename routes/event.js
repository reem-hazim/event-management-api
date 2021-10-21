const express = require('express')
const mongoose = require('mongoose')
const Event = require('../models/event')
const router = express.Router({mergeParams: true})
const {verifyToken, isCreator} = require('../middleware')
const wrapAsync = require('../utils/wrapAsync')
const User = require('../models/user')

router.post('/:id/register', verifyToken, async (req, res)=>{
	const {id:event_id} = req.params;
	const event = await Event.findById(event_id)
	const user = await User.findById(req.user.user_id)
	if (!event)
		return res.send("This is not a valid event ID.")
	if(!user)
		return res.send("Invalid user.")

	// check if user is already registered
	if (user.isRegistered(event._id)){
		return res.send("You are already registered in this event")
	}
	event.registeredUsers.push(user._id)
	await event.save()
	user.registeredEvents.push(event._id)
	await user.save()
	return res.send(`You have been registered to event ${event_id}`)
})

router.post('/:id/unregister', verifyToken, wrapAsync(async (req, res)=>{
	const {id:event_id} = req.params;
	const {user_id} = req.user
	const user = await User.findById(user_id)
	if (!user.isRegistered(event_id)){
		return res.send("You are not registered in this event")
	}
	await User.findByIdAndUpdate(user_id, { $pull: {registeredEvents: event_id }}, {new:true, useFindAndModify: false})
	await Event.findByIdAndUpdate(event_id, { $pull: {registeredUsers: user_id }}, {new:true, useFindAndModify: false})
	return res.send(`You have been unregistered from event ${event_id}`)
}))

router.route('/:id')
	.get(wrapAsync(async (req, res)=> {
		const event = await Event.findById(req.params.id)
		res.json(event)
	}))
	.delete(verifyToken, isCreator, wrapAsync(async (req, res)=>{
		await Event.findByIdAndDelete(req.params.id);
		// todo: maybe return list of all events again?
		res.send(`Deleted Event ${req.params.id}`)
	}))
	.put(verifyToken, isCreator, wrapAsync(async (req, res)=>{
		const event = await Event.findByIdAndUpdate(req.params.id, {...req.body}, {new:true});
		res.json(event)
	}))

router.route('/')
	// show all events
	.get(wrapAsync(async (req, res)=>{
		const events = await Event.find()
		res.json(events)
	}))
	// create new event
	.post(verifyToken, wrapAsync(async (req, res)=>{
		const event = new Event(req.body)
		event.creator = req.user.user_id
		event.save()
		res.json(event)
	}))

module.exports = router
const AppError = require('../utils/AppError')
const Event = require('../models/event')
const User = require('../models/user')

module.exports.register = async (req, res)=>{
	const {id:event_id} = req.params;
	const event = await Event.findById(event_id)
	const user = req.user
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
}

module.exports.unregister = async (req, res)=>{
	const {id:event_id} = req.params;
	const user = req.user
	if (!user.isRegistered(event_id))
		throw new AppError("You are not registered in this event.", 400, "Not registered.")
	
	const updatedUser = await User.findByIdAndUpdate(user._id, { $pull: {registeredEvents: event_id }}, {new:true, useFindAndModify: false})
	await Event.findByIdAndUpdate(event_id, { $pull: {registeredUsers: user._id }}, {new:true, useFindAndModify: false})
	return res.json(await updatedUser.populateUser())
}

module.exports.getEvents = async (req, res)=>{
	const events = await Event
							.find()
							.populate({path: 'creator', select: ['firstName', 'lastName', 'email']})
							.populate({path: 'registeredUsers', select: ['firstName', 'lastName', 'email']})
	res.json(events)
}

module.exports.createEvent = async (req, res)=>{
	const event = new Event(req.body)
	event.creator = req.user._id
	await event.save()
	return res.json(await event.populateEvent())
}

module.exports.getEvent = async (req, res)=> {
	const event = await Event.findById(req.params.id)
	res.json(await event.populateEvent())
}

module.exports.deleteEvent = async (req, res)=>{
	const deletedEvent = await Event.findByIdAndDelete(req.params.id);
	res.json(deletedEvent)
}

module.exports.updateEvent = async (req, res)=>{
	const event = await Event.findByIdAndUpdate(req.params.id, {...req.body}, {new:true});
	res.json(event)
}
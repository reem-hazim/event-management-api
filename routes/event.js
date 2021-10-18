const express = require('express')
const mongoose = require('mongoose')
const Event = require('../models/event')
const router = express.Router({mergeParams: true})
const {verifyToken, isCreator} = require('../middleware')
const wrapAsync = require('../utils/wrapAsync')

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
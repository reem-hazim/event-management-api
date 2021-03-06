if(process.env.NODE_ENV !== "production"){
	require("dotenv").config();
}
const express = require("express");
const path = require('path');
const mongoose = require('mongoose');

//Require models
const User = require('./models/user');
const Event = require('./models/event');

// Require utils
const AppError = require('./utils/AppError');
const wrapAsync = require('./utils/wrapAsync');

// Require routes
const eventRoutes = require('./routes/event');
const userRoutes = require('./routes/user');

const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/eventAPI'

mongoose.connect(dbUrl, {
	useNewUrlParser: true,
});


const db = mongoose.connection;
db.on("error", console.log.bind(console, "connection error"));
db.once("open", ()=>{
	console.log("Database connected")
});

const app = express();

app.use(express.urlencoded({extended: true}))

app.use("/events", eventRoutes)
app.use("/", userRoutes)

app.use('*', (req, res, next)=>{
	next(new AppError('Page Not Found', 404))
})

// Error handler
app.use((err, req, res, next)=>{
	const {status = 500, message = "Something went wrong", name="Error"} = err;
	res.status(status).json({
		"name": name,
		"message": message});
})

const port = process.env.PORT || 3000;

app.listen(port, ()=>{
	console.log(`Serving on port ${port}`);
})



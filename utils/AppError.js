class AppError extends Error{
	constructor(message, status, name="App Error"){
		super();
		this.message= message;
		this.status = status;
		this.name = name
	}
}

module.exports = AppError;
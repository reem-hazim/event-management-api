# Event Management API

This is an API for an event management platform. Users can create, edit, and delete events using this API.

All request bodies must be form-encoded, except for the `/register` route, which requires the content-type to be `multipart/form-data` to support image upload.

All endpoints return a json object.

<br/>
## Authentication
Authentication is supported using JSON web tokens.

When the user creates an account using the `/register` endpoints, they must set an email and a password. These credentials can then be used to log in to an account through the `login` endpoint. The `login` endpoint will return a json object containing a JSON web token (`token`). **This token must be added to the header under the `x-access-token` key for all endpoints that require authorization and/or authentication.** In the endpoint documentation below, it is indicated whether an endpoint requires an authentication token or not.

<br/>
## Errors
All errors return a json object with the following properties:

**name** (string): The name of the error

**message** (string): The error message.

<br/>

## Return Objects

### The User Object
An object containing information about a specific user

_**format**_:

**_id** (string): The user ID

**firstName** (string): The user's first name

**lastName** (string): The user's last name

**dob** (string): The user's date of birth

**email** (string): The user's email

**registeredEvents** (list of Events): A list of all the events this user is registered for. Only displays the event name and ID for each event.

**image** (string): URL of the user's avatar image.

**token** (string): User's current active authentication token. 

<br/>
### The Event Object
An object containing information about a specific event.

_**format**_:

**_id** (string): The ID of the event.

**name** (string): The event name

**location** (string): The event location

**startDate** (string): The event start date and time in ISO date format.

**endDate** (string): The event end date and time in ISO date format.

**registeredUsers** (list of `User`s): A list of users who are registered in the event. Displays ID, first name, last name, and email of each user.

**creator** (`User` object): The user who created this event. Displays the first name, last name, ID and email of the user.

<br/>
## User Endpoints:

### `GET` /user/<**id**>

_Token required_

Retrieves information about the user with id `id`. 

_**Returns**_:

The `User` object for the user with id `id`
  
<b/>
###`POST` /register

_Token not required_
Register a new user. **Note that this endpoint requires the body's content-type to be multipart/form-data to support image upload**.

_**Parameters**_:

**firstName** (string) - required: The user's first name

**lastName** (string) - required: The user's last name

**dob** (string) - required: The user's date of birth

**email** (string) - required: The user's email

**password** (string) - required: The user's password. Must contain a minimum of 8 characters and at least one uppercase letter, one lowercase letter and one special character.

**image** (jpeg, jpg or png) - required: The user's avatar image.

_**Returns**_:

A `User` object for the newly created user.

<br/>
###`POST` /login

_Token not required_

Log in to your account. This route  generates and returns a token that you should add to your header when making requests that require authentication, such as creating/deleting/editing events.

_**Parameters**_:

**email** (string) - required: The user's email

**password** (string) - required: The user's password. Must contain a minimum of 8 characters and at least one uppercase letter, one lowercase letter and one special character.

_**Returns**_:

A `User` object for the logged-in user. The object contains a token that must be copied into the header for all endpoints that require authentication.

<br/>
### `POST` /logout

_Token required_

Log out of your account. You must be authenticated for this endpoint. This endpoint will make your current token invalid, so it cannot be used for subsequent authentication. 

_**Return format**_:

**token** (string): The currently-active token.

**expired** (boolean): Whether the token is now expired.

<br/>
##Event Endpoints

### `GET` /events

_Token not required_

Get all events on the platform.

_**Returns**_

A list of `Event` objects.

<br/>
### `POST` /events
_Token required_

Create a new event on the platform.

_**Parameters**_:

**name** (string) - required: Name of the event

**startDate** (string) - required: Starting date and time of the event in ISO format.

**endDate** (string) - required: End date and time of the event in ISO format. Must be later than the start date.

**location** (string) - required: Location of the event.

_**Returns**_:

An `Event` object of the newly created event.

<br/>

### `GET` /events/<**id**>

_Token not required_

Retrieves information about the event with ID `id`.

_**Returns**_:

'Event' object for the event with ID `id`

<br/>
### `PUT` /events/<**id**>

_Token required_

Edit the event with ID `id`. You must be the creator of this event to edit it.

_**Parameters**_:

At least of the following parameters must be specified. Any parameters that are not specified in the request body will remain unchanged. 

**name** (string): Name of the event

**startDate** (string): Starting date and time of the event in ISO format.

**endDate** (string): End date and time of the event in ISO format. Must be later than the start date.

**location** (string): Location of the event.

_**Returns**_:

An `Event` object reflecting the changes made to this event

<br/>

### `DELETE` /events/<**id**>

_Token required_

Delete the event with ID `id`. You must be the creator of this event to delete it.

_**Returns**_:

The `Event` object of the deleted event.

<br/>

### `POST` /events/<**id**>/register

_Token required_

Register to attend the event with ID `id`.

_**Returns**_:

The `User` object of the current user, with the event added to the `registeredEvents` property.

<br/>

### `POST` /events/<**id**>/unregister

_Token required_

Unregister from the event with ID `id`.

_**Returns**_:

The `User` object of the current user, with the event removed from the `registeredEvents` property.














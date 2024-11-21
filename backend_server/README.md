### User Management API
This is a simple Express.js-based API to manage users in a SQLite database. It provides routes to create, read, update, and delete users. Each user is represented by a unique userId, and other details like firstName, lastName, email, and department.



### Table of Contents
Prerequisites
Installation
API Endpoints
    GET /users
    POST /users
    PUT /users
    DELETE /users
File Structure
Configuration
    Port
    Database Path
Database
Error Handling

### Prerequisites
Before you begin, ensure you have the following installed:

Node.js (version 14 or higher)
npm (comes with Node.js)
SQLite (the SQLite3 database)


### API Endpoints
# GET /users
This endpoint retrieves all users from the database.

URL: /users
Method: GET
Query Parameters: None
Response:

200 OK - Returns an array of users.
json
Copy code
[
  {
    "userId": "uuid-1",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "department": "HR"
  },
  {
    "userId": "uuid-2",
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane@example.com",
    "department": "Engineering"
  }
]
400 Bad Request - If there's an error fetching the users.
# POST /users
This endpoint creates a new user in the database.

URL: /users
Method: POST
Request Body:

json
Copy code
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "department": "HR"
}
Response:

200 OK - New user added successfully.

json
Copy code
"New User added successfully..."
400 Bad Request - If the email already exists in the database.

json
Copy code
"User already exists with the EmailID. Please use a different EmailID."
# PUT /users
This endpoint updates an existing user. It first checks if the email is provided, and if so, checks if it is already taken by another user (excluding the current user).

URL: /users
Method: PUT
Request Body:

json
Copy code
{
  "userId": "uuid-1",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john_new@example.com",
  "department": "Finance"
}
Response:

200 OK - User updated successfully.

json
Copy code
"User Updated Successfully..."
409 Conflict - If the email is already in use by another user.

json
Copy code
{
  "error": "Email already in use by another user."
}
404 Not Found - If the user with the provided userId does not exist.

json
Copy code
"User not found."
500 Internal Server Error - For unexpected server errors.

# DELETE /users
This endpoint deletes a user by their userId.

URL: /users
Method: DELETE
Request Body:

json
Copy code
{
  "userId": "uuid-1"
}
Response:

200 OK - User deleted successfully.


"User Deleted Successfully..."
500 Internal Server Error - If there's an error deleting the user.

File Structure
The basic structure of the project is as follows:


/user-management-api
  |-- /node_modules          # Dependencies installed by npm
  |-- /database.db           # SQLite database file (created when the app runs)
  |-- app.js                 # Main server code (Express app with routes)
  |-- package.json           # npm configuration file with dependencies
  |-- README.md              # This file
Configuration
Port
By default, the server listens on port 8080. However, you can change the port by setting the PORT environment variable:

bash
Copy code
PORT=5000 npm start
Database Path
The database path is configured in the code as follows:

javascript
Copy code
const dbPath = path.join(__dirname, 'database.db');
If you want to change the location of the database, modify the dbPath value to point to a different directory or filename.

Database
The application uses SQLite as the database to store user information. The users table schema should have the following columns:

userId: UUID (Primary Key)
firstName: String
lastName: String
email: String (Unique)
department: String
Here is the SQL schema to create the users table:

CREATE TABLE users (
    userId TEXT PRIMARY KEY,
    firstName TEXT NOT NULL,
    lastName TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    department TEXT NOT NULL
);
## Error Handling
The API has basic error handling for each route. In case of an error, the server will respond with an appropriate status code and message.

400 Bad Request - Sent when there is an issue with the data provided in the request body (e.g., missing fields, or duplicate data).
404 Not Found - Sent when a user cannot be found in the database (e.g., invalid userId in the PUT or DELETE request).
409 Conflict - Sent when there's an issue with data uniqueness (e.g., trying to create a user with an already existing email).
500 Internal Server Error - Sent when an unexpected error occurs on the server (e.g., database issues).
Conclusion
This application allows you to manage users in an SQLite database using Express.js. You can add, update, retrieve, and delete users using the provided RESTful API. Ensure the database schema is set up correctly before running the application.

For any issues or questions, feel free to open an issue in the repository or contact the developer.
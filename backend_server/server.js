// const express = require('express'); // For creating the Express application
// const app = express();
// const path = require('path'); // For working with file and directory paths
// const { open } = require('sqlite'); // To interact with SQLite database
// const sqlite3 = require('sqlite3'); // SQLite driver
// const cors = require('cors'); // Middleware for enabling CORS (Cross-Origin Resource Sharing)
// const { v4: uuidv4 } = require('uuid'); // To generate unique IDs for users

// // Setting the port and database path
// const port = process.env.port || 8080; // Default port 8080, or the port from the environment
// const dbPath = path.join(__dirname, 'database.db'); // Path to the SQLite database

// let db; // To store the database connection

// // Middleware setup to handle JSON requests and enable CORS
// app.use(express.json());
// app.use(cors());

// // Initialize database connection and start the server
// const initializeDBAndServer = async () => {
//     try {
//         // Open the SQLite database
//         db = await open({
//             filename: dbPath,
//             driver: sqlite3.Database
//         });

//         // Start the server once the database is successfully connected
//         app.listen(port, () => {
//             console.log(`Server started at http://localhost:${port}`);
//         });
//     } catch (error) {
//         // Log error and exit process if database connection fails
//         console.log(`ERROR : ${error}`);
//         process.exit(1);
//     }
// };

// // Call the function to initialize DB and start server
// initializeDBAndServer();

// // Route to fetch all users
// app.get('/users', async (request, response) => {
//     try {
//         // SQL query to fetch all users from the database
//         const query = `SELECT * FROM users ORDER BY userId;`;
//         const result = await db.all(query); // Execute the query and fetch all users
//         response.status(200).send(result); // Send the result as response
//     } catch (error) {
//         // Handle errors if any during fetching data
//         response.status(400).send(`Error : ${error}`);
//     }
// });

// // Route to add a new user
// app.post('/users', async (request, response) => {
//     try {
//         // Destructure the request body to get user details
//         const { firstName, lastName, email, department } = request.body;

//         // Check if the email already exists in the database
//         const searchQuery = `SELECT * FROM users WHERE email = '${email}';`;
//         const result = await db.get(searchQuery);

//         // If user with the same email exists, return an error message
//         if (result) {
//             response.status(400).send(`User already exists with the EmailID. Please use a different EmailID.`);
//         } else {
//             // If email doesn't exist, create a new user
//             const newUserId = uuidv4(); // Generate a unique user ID using uuid
//             const query = `INSERT INTO users (userId, firstName, lastName, email, department)
//                            VALUES('${newUserId}', '${firstName}', '${lastName}', '${email}', '${department}');`;
//             await db.run(query); // Execute the insert query
//             response.status(200).send('New User added successfully...');
//         }
//     } catch (error) {
//         // Handle any errors during the add user process
//         response.status(400).send(`Error : ${error}`);
//     }
// });

// // Route to update an existing user
// app.put('/users', async (request, response) => {
//     try {
//         // Destructure the request body to get user details
//         const { userId, firstName, lastName, department } = request.body;
//         console.log(userId,firstName,lastName,department);
        

//         // Fetch the existing user from the database using userId
//         // const getUser = `SELECT * FROM users WHERE userId = '${userId}';`;
//         // const result = await db.get(getUser);
        

//         // // If the user is not found, return an error
//         // if (!result) {
//         //     return response.status(404).send('user not found.');
//         // }
//         const query = `
//             UPDATE users 
//             SET firstName = '${firstName}', lastName = '${lastName}', 
//             department = '${department}' 
//             WHERE userId = '${userId}';
//         `;
//         await db.run(query); // Execute the update query

//         response.status(200).send('User Updated Successfully...');
//         console.log('user updated');
        
//     } catch (error) {
//         // Handle unexpected errors during the update process
//         response.status(500).json({ error: "An unexpected error occurred." });
//     }
// });

// // Route to delete a user
// app.delete('/users', async (request, response) => {
//     try {
//         // Extract userId from the request body
//         const { userId } = request.body;

//         // SQL query to delete the user by userId
//         const query = `DELETE FROM users WHERE userId = '${userId}';`;
//         await db.run(query); // Execute the delete query

//         response.status(200).send('User Deleted Successfully...');
//     } catch (error) {
//         // Handle errors during the deletion process
//         response.status(500).send(`An error occurred while deleting the user.`);
//     }
// });













const express = require('express');
const app = express();
const port = process.env.PORT || 3012;

const path = require('path');
const { open } = require('sqlite');
const sqlite3 = require('sqlite3');
const dbPath = path.join(__dirname, "./database.db");
const cors = require('cors');

app.use(express.json());
app.use(cors());

let db = null;

const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const jwt=require('jsonwebtoken');

const initializeDBAndServer = async () => {
    try {
        db = await open({
            filename: dbPath,
            driver: sqlite3.Database
        });
        app.listen(port, () => {
            console.log(`Server is running at http://localhost:${port}/`);
        });
    } catch (error) {
        console.log(`DB ERROR: ${error.message}`);
        process.exit(1);
    }
};

initializeDBAndServer();



app.get("/", (request, response) => {
    response.send('Transactions  backend testing is working... go for different routes');
});

// Endpoint for user registration
app.post("/sign-up/", async (request, response) => {
    const { username, email, password } = request.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
        const dbUser = await db.get( `SELECT username FROM users WHERE username = '${username}';`);
        if (dbUser) {
            response.status(400).send({ message: "User already exists." });
        } else {
            const userId = uuidv4();
            const currentDate=new Date().toLocaleString()
            await db.run(`INSERT INTO users(user_id, username, email, password,created_at) VALUES('${userId}','${username}','${email}','${hashedPassword}','${currentDate}');`);
            response.status(201).send({ message: "User created successfully." });
        }
    } catch (error) {
        console.log(`DB Error: ${error.message}`);
        response.status(500).send({ message: "Internal server error." });
    }
});


// login this user 


app.post("/login/",async (request,response)=>{
    const {username,password}=request.body
    try {
        const dbUser=`select * from users where username='${username}';`;
        const checkingUserExists=await db.get(dbUser)
        if(checkingUserExists===undefined){
            response.status(401).send({message:'User Not Found...'})
        }else{
            const isValidPassword=await bcrypt.compare(password,checkingUserExists.password)
            if(isValidPassword===true){
                const payload={username:username}
                const jwtToken=jwt.sign(payload,process.env.JWT_SECRET || 'my_secret_jwt_token')
                response.status(200).send({jwtToken})
            }else{
                response.status(400).send("Invalid Password")
            }
        }
    } catch (error) {
        response.status(500).send({message:'Internal Server Error'})
    }
})




const middleWare=(request,response,next)=>{
    let jwtToken;
    const authHeader=request.headers['authorization']
    if(authHeader){
        jwtToken=authHeader.split(' ')[1]
    }
    if(jwtToken){
        jwt.verify(jwtToken,'my_secret_jwt_token',async (error,payload)=>{
            if(error){
                response.status(401).send({message:'Invalid Token'})
            }else{
                request.username=payload.username
                next()
            }
        })
    }else{
        response.status(401).send({message:'Invalid Token'})
    }
}



app.get('/users/',middleWare,async(request,response)=>{
    const query=`select * from users;`
    const users=await db.all(query)
    response.status(200).send(users)
})

const getUserId=async(username)=>{
    const response=`select * from users where username='${username}';`
    const user=await db.get(response)
    return user
}




app.post('/transactions/', middleWare, async (request, response) => {
    try {
        // Extract the username from the JWT payload
        const { username } = request;

        // Get the user details based on the username
        const user = await getUserId(username);
        if (!user) {
            return response.status(404).send({ message: "User not found" });
        }

        // Extract transaction details from the request body
        const { amount, transaction_type, status } = request.body;

        // Generate a new transaction ID and get the current time
        const newTransactionId = uuidv4();
        const currentTime = new Date().toLocaleString();

        // Construct the query to insert the new transaction
        const query = `INSERT INTO transactions( transaction_id , amount , transaction_type , user_id , status , timestamp)
                       VALUES('${newTransactionId}',${amount},'${transaction_type}','${user.user_id}','${status}','${currentTime}');`;

        // Execute the query to insert the new transaction
        const result = await db.run(query);

        // Send a response indicating the transaction was added successfully
        response.status(200).send('New transaction added');
    } catch (error) {
        // Catch and handle any errors that occur during the transaction insertion
        console.error(`DB Error: ${error.message}`);
        response.status(500).send({ message: "Internal server error" });
    }
});


app.get('/transactions/', middleWare, async (request, response) => {
    try {
        // Extract the username from the JWT payload
        const { username } = request;

        // Get the user details based on the username
        const user = await getUserId(username);
        if (!user) {
            return response.status(404).send({ message: "User not found" });
        }

        // Query to get all transactions for the user
        const query = `SELECT * FROM transactions WHERE user_id = '${user.user_id}';`;
        const allTransactions = await db.all(query);

        // Query to get the total deposit amount for the user
        const depositTotalQuery = `SELECT SUM(amount) AS totalDeposit FROM transactions WHERE user_id = '${user.user_id}' AND transaction_type = 'DEPOSIT';`;
        const depositTotal = await db.get(depositTotalQuery);

        // Query to get the total withdrawal amount for the user
        const withdrawlTotalQuery = `SELECT SUM(amount) AS totalWithdrawal FROM transactions WHERE user_id = '${user.user_id}' AND transaction_type = 'WITHDRAWAL';`;
        const withdrawlTotal = await db.get(withdrawlTotalQuery);

        // Send the response with all transactions and total deposit/withdrawal sums
        response.status(200).send({
            allTransactions,
            totalDeposit: depositTotal.totalDeposit || 0,
            totalWithdrawal: withdrawlTotal.totalWithdrawal || 0
        });
    } catch (error) {
        // Catch and handle any errors that occur during the database queries
        console.error(`DB Error: ${error.message}`);
        response.status(500).send({ message: "Internal server error" });
    }
});




app.put('/transactions/', middleWare, async (request, response) => {
    try {
        // Extract the username from the JWT payload
        const { username } = request;

        // Get the user details based on the username
        const user = await getUserId(username);
        if (!user) {
            return response.status(404).send({ message: "User not found" });
        }

        // Extract the transaction status and transaction_id from the request body
        const { status, transaction_id } = request.body;

        // Construct the query to update the transaction status
        const query = `UPDATE transactions SET status = '${status}' WHERE user_id = '${user.user_id}' and transaction_id = '${transaction_id}';`;

        // Execute the query to update the transaction
        const result = await db.run(query);

        // Send a response indicating the transaction was updated successfully
        response.status(200).send({ message: 'Transaction Updated Successfully' });
    } catch (error) {
        // Catch and handle any errors that occur during the transaction update
        console.error(`DB Error: ${error.message}`);
        response.status(500).send({ message: "Internal server error" });
    }
});




const express = require('express');
const app = express();
const port = process.env.PORT || 3013;

const path = require('path');
const { open } = require('sqlite');
const sqlite3 = require('sqlite3');
const dbPath = path.join(__dirname, "./database.db");
const cors = require('cors');

app.use(express.json());
app.use(cors());

let db = null;

const { v4: uuidv4 } = require('uuid');
// const bcrypt = require('bcrypt');
const bcrypt = require('bcryptjs');

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




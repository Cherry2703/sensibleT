CREATE TABLE users (
    user_id TEXT PRIMARY KEY,           
    username TEXT NOT NULL UNIQUE, 
    email TEXT NOT NULL UNIQUE,    
    password TEXT NOT NULL,        
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE  transactions (
        transaction_id TEXT PRIMARY KEY,
        amount REAL NOT NULL,
        transaction_type TEXT CHECK(transaction_type IN ('DEPOSIT', 'WITHDRAWAL')) NOT NULL,
        user_id TEXT NOT NULL,
        status TEXT CHECK(status IN ('PENDING', 'COMPLETED', 'FAILED')) DEFAULT 'PENDING',
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(user_id)
    );






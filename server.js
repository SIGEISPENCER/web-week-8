// Import necessary modules
const express = require('express'); 
const mysql = require('mysql2'); 
const path = require('path');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv'); 
const session = require('express-session');

// Load environment variables from .env file
dotenv.config();

// Verify environment variables
console.log("DATABASE_HOST:", process.env.DATABASE_HOST);
console.log("DATABASE_USER:", process.env.DATABASE_USER);
console.log("DATABASE_PASSWORD:", process.env.DATABASE_PASSWORD);
console.log("DATABASE:", process.env.DATABASE);

// Create an Express application
const app = express();
const port = 3000;

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Middleware to parse URL-encoded and JSON request bodies
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Configure session middleware
app.use(session({
    key: 'session_cookie_name',
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: false,
}));

// Create a MySQL connection using environment variables
const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE // Ensure this is set correctly
});

// Connect to the MySQL database
db.connect((err) => {
    if (err) {
        console.log("Error connecting to the database!", err.message);
    } else {
        console.log("Database connected successfully!");

        // Create the 'users' table if it does not already exist
        const createUsers = `CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY, 
            email VARCHAR(255), 
            username VARCHAR(255), 
            password VARCHAR(255),
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )`;
        db.query(createUsers, (err) => {
            if (err) {
                console.log("Error creating users table!", err.message);
            } else {
                console.log("Users table created successfully!");
            }
        });

        // Create the 'expenses' table if it does not already exist
        const createExpenses = `CREATE TABLE IF NOT EXISTS expenses (
            id INT AUTO_INCREMENT PRIMARY KEY,
            userId INT,
            category VARCHAR(255),
            amount DECIMAL(10, 2),
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (userId) REFERENCES users(id)
        )`;
        db.query(createExpenses, (err) => {
            if (err) {
                console.log("Error creating expenses table!", err.message);
            } else {
                console.log("Expenses table created successfully!");
            }
        });
    }
});

// Serve the home page as the landing page
app.get('/', (req, res) => {
    res.sendFile('home.html', { root: path.join(__dirname, 'public') });
});

// Serve the login page
app.get('/login', (req, res) => {
    res.sendFile('login.html', { root: path.join(__dirname, 'public') });
});

// Serve the registration page
app.get('/register', (req, res) => {
    res.sendFile('register.html', { root: path.join(__dirname, 'public') });
});

// Serve the dashboard page
app.get('/dashboard', (req, res) => {
    if (req.session.user && req.session.user.id) {
        res.sendFile('dashboard.html', { root: path.join(__dirname, 'public') });
    } else {
        res.redirect('/dashboard.html');
    }
});

// Handle user registration
app.post('/register', async (req, res) => {
    const { email, username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const sql = 'INSERT INTO users (email, username, password, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)';
    const values = [email, username, hashedPassword, new Date(), new Date()];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.log(err);
            res.status(500).send('Error registering user');
        } else {
            //res.json({'message':'user registered succesfully!'})
            res.redirect('/login')
            console.log(`user with email ${email} has been succesfully regiestered`)
        }
    });
});

// Handle user login
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const sql = 'SELECT * FROM users WHERE username = ?';
    db.query(sql, [username], async (err, results) => {
        if (err) {
            console.log("Error fetching users", err.message);
            res.status(500).send("Internal Server Error");
        } else if (results.length > 0) {
            const match = await bcrypt.compare(password, results[0].password);
            if (match) {
                const user = results[0];
                req.session.user = {id: user.id, username: user.username}
                //res.json({'message':'Welcome!'})
                res.redirect('/dashboard')
                console.log(`user with username ${username} successfully logged in`)
            } else {
                res.status(401).send("Invalid Username or Password!");
            }
        } else {
            res.status(401).send("Invalid Username or Password!");
        }
    });
});

// Route to add an expense
app.post('/expense', (req, res) => {
    const { category, amount } = req.body;
    const userId = req.session.user.id
    const sql = 'INSERT INTO expenses (user_Id, category, amount) VALUES (?, ?, ?)';
    db.query(sql, [userId, category, amount], (err, result) => {
        if (err) {
            console.error('Error adding expense:', err);
            return res.status(500).send('Internal Server Error');
        }
        res.send('Expense added successfully');
    });
});

// Route to delete an expense by ID
app.delete('/expense/:id', (req, res) => {
    const expenseId = req.params.id;
    const userId = req.session.user.id
    const sql = 'DELETE FROM expenses WHERE id = ?';
    db.query(sql, [expenseId], (err, result) => {
        if (err) {
            console.error('Error deleting expense:', err);
            return res.status(500).send('Internal Server Error');
        }
        res.send('Expense deleted successfully');
    });
});


// Start the server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});

// Load environment variables
require('dotenv').config();

// Import modules
const express = require('express');
const ejs = require('ejs');
const path = require('path');
const mysql = require('mysql2');
var session = require ('express-session');
const expressSanitizer = require('express-sanitizer');


// Create the express application object
const app = express();
const port = process.env.PORT || 8000;

// Tell Express that we want to use EJS as the templating engine
app.set('view engine', 'ejs');

// Set up the body parser
app.use(express.urlencoded({ extended: true }));

// Create an input sanitizer (Lab 8b – sanitisation)
app.use(expressSanitizer());

// Set up public folder (for css and static js)
app.use(express.static(path.join(__dirname, 'public')));

// Session setup (Lab 8a – authorisation)
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'somerandomstuff',
    resave: false,
    saveUninitialized: false,
    cookie: {
      // 10 minutes in milliseconds
      maxAge: 600000,
    },
  })
);

// Define our application-specific data (available in all templates as shopData)
app.locals.shopData = { shopName: "Bertie's Books" };

// Define the database connection pool
const db = mysql.createPool({
  host: process.env.BB_HOST || process.env.DB_HOST || 'localhost',
  user: process.env.BB_USER || process.env.DB_USER || 'berties_books_app',
  password:
    process.env.BB_PASSWORD || process.env.DB_PASSWORD || 'qwertyuiop',
  database:
    process.env.BB_DATABASE || process.env.DB_DATABASE || 'berties_books',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});
global.db = db;

// Logging errors instead of crashing outright
db.getConnection((err, connection) => {
  if (err) {
    console.error('Error getting DB connection:', err.message);
  } else {
    console.log('Database connection pool initialised.');
    connection.release();
  }
});

// Load the route handlers
const mainRoutes = require('./routes/main');
app.use('/', mainRoutes);

const usersRoutes = require('./routes/users');
app.use('/users', usersRoutes);

const booksRoutes = require('./routes/books');
app.use('/books', booksRoutes);

const weatherRoutes = require('./routes/weather');
app.use('/weather', weatherRoutes);

const apiRoutes = require('./routes/api');
app.use('/api', apiRoutes);

// Start the web app listening
app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`);
});

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
app.locals.appData = { appName: "HealthWise" };

// Define the database connection pool
const db = mysql.createPool({
  host: process.env.HEALTH_HOST || 'localhost',
  user: process.env.BB_USER || 'health_app',
  password: process.env.HEALTH_PASSWORD ||  'qwertyuiop',
  database: process.env.HEALTH_DATABASE || 'health',
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

const activityRoutes = require('./routes/activity');
app.use('/activity', activityRoutes);

const metricRoutes = require('./routes/metrics');
app.use('/metrics', metricRoutes);

const goalsRoutes = require('./routes/goals');
app.use('/goals', goalsRoutes);

//OLD
const apiRoutes = require('./routes/api');
app.use('/api', apiRoutes);

// Start the web app listening
app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`);
});

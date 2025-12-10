// Create a new router
const express = require('express');
const router = express.Router();

const redirectLogin = (req, res, next) => {
 if (!req.session.userId ) {
 res.redirect('../users/login') // redirect to the login page
 } else {
 next (); // move to the next middleware function
 }
}

// Home page
router.get('/', (req, res) => {
  res.render('index.ejs');
});

// About page
router.get('/about', (req, res) => {
  res.render('about.ejs');
});
 router.get('/logout', redirectLogin, (req,res) => {
 req.session.destroy(err => {
 if (err) {
 return res.redirect('./')
 }
 res.send('you are now logged out. <a href='+'./'+'>Home</a>');
 })
 })

// Export the router object so index.js can access it
module.exports = router;

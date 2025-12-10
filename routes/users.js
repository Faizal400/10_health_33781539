// Create a new router
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
require('dotenv').config();
const { check, validationResult } = require('express-validator'); // Lab 8b – validation

const saltRounds = 10;
// Session-based access control helper (Lab 8a)
const redirectLogin = (req, res, next) => {
 if (!req.session.userId ) {
 res.redirect('./login') // redirect to the login page
 } else {
 next (); // move to the next middleware function
 }
}

// Registration form
router.get('/register', (req, res) => {
  res.render('register.ejs');
});

// Graceful handler for accidental GET /users/registered
router.get('/registered', (req, res) => {
  // We only support POST for registration – bounce GETs back to the form
  res.redirect('/users/register');
});

// Handle registration – validation + sanitisation + hash + insert
// Lab 8b Tasks 2, 3, 4, 6, 7, 8
router.post(
  '/registered',
  [
    // --- Validation rules (express-validator) ---
    check('email')
      .isEmail()
      .withMessage('Please enter a valid email address.'),
    check('username')
      .isLength({ min: 5, max: 20 })
      .withMessage('Username must be between 5 and 20 characters.'),
    check('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long.'),
    check('first')
      .notEmpty()
      .withMessage('First name is required.')
      .isLength({ max: 100 })
      .withMessage('First name must be at most 100 characters.'),
    check('last')
      .notEmpty()
      .withMessage('Last name is required.')
      .isLength({ max: 100 })
      .withMessage('Last name must be at most 100 characters.'),
  ],
  (req, res, next) => {
    // Check validation result
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // If invalid, just re-render the register page (Lab 8b spec)
      // (You could also pass errors + formData for nicer UX)
      return res.status(400).render('register.ejs');
    }

    // Extract and sanitise fields – Lab 8b sanitisation + XSS protection
    let { username, first, last, email, password } = req.body;

    first = req.sanitize(first);
    last = req.sanitize(last);
    username = req.sanitize(username);
    email = req.sanitize(email);

    // NOTE: we do NOT sanitise password so that we don't silently
    // change what the user typed. We only hash it.
    // This still allows passwords like aaaaAAAA1234! as required.

    bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
      if (err) {
        return next(err);
      }

      const sql =
        'INSERT INTO users (username, first, last, email, password_hash) VALUES (?, ?, ?, ?, ?)';
      const params = [username, first, last, email, hashedPassword];

      db.query(sql, params, (err2, result) => {
        if (err2) {
          return next(err2);
        }

        let msg =
          'Hello ' +
          first +
          ' ' +
          last +
          ', you are now registered! We will send an email to you at ' +
          email +
          '.';

        // Lab-style debug output (fine for coursework)
        msg +=
          '<br>Your username is: ' +
          username +
          '<br>Your password is: ' +
          password +
          '<br>Your hashed password is: ' +
          hashedPassword;

        res.send(msg);
      });
    });
  }
);

// List users (no passwords shown) - protected
router.get('/list', redirectLogin, function (req, res, next)  {
  const sql =
    'SELECT id, username, first, last, email FROM users ORDER BY id';

  db.query(sql, (err, result) => {
    if (err) {
      return next(err);
    }
    res.render('users_list.ejs', { users: result });
  });
});

// Login form
router.get('/login', (req, res) => {
  res.render('login.ejs');
});

// Handle login – validation-lite + sanitisation + compare + audit + session
router.post('/loggedin', (req, res, next) => {
  let { username, password } = req.body;

  // Simple validation for login fields (Lab 8b Task 4 extension)
  if (!username || !password) {
    return res.status(400).send('Username and password are required.');
  }

  // Sanitise username to avoid XSS in logs / audit
  username = req.sanitize(username);

  const sql =
    'SELECT id, username, password_hash FROM users WHERE username = ?';

  db.query(sql, [username], (err, rows) => {
    if (err) {
      return next(err);
    }

    if (rows.length === 0) {
      const message = 'Login failed: user not found';
      return logAudit(username, false, message, req, (logErr) => {
        if (logErr) return next(logErr);
        res.send(message);
      });
    }

    const user = rows[0];
    const hashedPassword = user.password_hash;

    bcrypt.compare(password, hashedPassword, (err2, match) => {
      if (err2) {
        return next(err2);
      }

      if (match) {
        const message = 'Login successful. Welcome, ' + user.username + '!';

        // Save user session here, when login is successful (Lab 8a)
        req.session.userId = user.username;

        logAudit(username, true, message, req, (logErr) => {
          if (logErr) return next(logErr);
          res.send(message);
        });
      } else {
        const message = 'Login failed: incorrect password';
        logAudit(username, false, message, req, (logErr) => {
          if (logErr) return next(logErr);
          res.send(message);
        });
      }
    });
  });
});

// Helper: write an audit log entry
function logAudit(username, success, message, req, callback) {
  const sql =
    'INSERT INTO audit_log (username, success, message, ip_address, user_agent) VALUES (?, ?, ?, ?, ?)';
  const params = [
    username || '',
    success ? 1 : 0,
    message,
    req.ip || '',
    req.headers['user-agent'] || '',
  ];

  db.query(sql, params, callback);
}

// View audit log - protected
router.get('/audit', redirectLogin, function (req, res, next) {
  const sql =
    'SELECT id, username, success, message, ip_address, user_agent, created_at FROM audit_log ORDER BY created_at DESC';

  db.query(sql, (err, result) => {
    if (err) {
      return next(err);
    }
    res.render('audit.ejs', { auditEntries: result });
  });
});

// Export the router object so index.js can access it
module.exports = router;

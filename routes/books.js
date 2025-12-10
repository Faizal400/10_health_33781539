// routes/books.js

// Create a new router
const express = require('express');
const router = express.Router();

// Session-based access control helper (Lab 8a)
const redirectLogin = (req, res, next) => {
  if (!req.session.userId) {
    res.redirect('../users/login'); // redirect to the login page
  } else {
    next(); // move to the next middleware function
  }
};

// Show search form (public)
router.get('/search', (req, res) => {
  res.render('search.ejs');
});

// Advanced search: title contains keyword (case-insensitive)
// + sanitisation to reduce XSS risk (Lab 8b Task 8)
router.get('/search-result', (req, res, next) => {
  const rawKeyword = req.query.keyword || '';
  const keyword = req.sanitize(rawKeyword); // express-sanitizer

  const sqlquery = 'SELECT name, price FROM books WHERE name LIKE ?';
  const searchTerm = '%' + keyword + '%';

  db.query(sqlquery, [searchTerm], (err, result) => {
    if (err) {
      return next(err);
    }
    res.render('search_results.ejs', { keyword, results: result });
  });
});

// List all books
router.get('/list', (req, res, next) => {
  const sqlquery = 'SELECT name, price FROM books ORDER BY name';

  db.query(sqlquery, (err, result) => {
    if (err) {
      return next(err);
    }
    res.render('list.ejs', { availableBooks: result });
  });
});

// Bargain books (< £20) – public catalogue
router.get('/bargainbooks', (req, res, next) => {
  const sqlquery = 'SELECT name, price FROM books WHERE price < 20 ORDER BY price';

  db.query(sqlquery, (err, result) => {
    if (err) {
      return next(err);
    }
    // Re-use list.ejs to keep it simple
    res.render('list.ejs', { availableBooks: result });
  });
});

// Show add-book form - protected (only logged-in users can add books)
router.get('/addbook', redirectLogin, (req, res, next) => {
  res.render('addbook.ejs');
});

// Handle add-book submission - protected + validation + sanitisation
router.post('/bookadded', redirectLogin, (req, res, next) => {
  // Sanitise inputs (Lab 8b Task 8)
  const name = req.sanitize(req.body.name || '');
  const rawPrice = req.sanitize(req.body.price || '');

  // Basic validation (Lab 8b Task 4 – extra validation on other pages)
  if (!name.trim()) {
    return res.status(400).send('Book name is required.');
  }

  const numericPrice = parseFloat(rawPrice);
  if (Number.isNaN(numericPrice) || numericPrice < 0) {
    return res.status(400).send('Price must be a positive number.');
  }

  const newrecord = [name, numericPrice];
  const sqlquery = 'INSERT INTO books (name, price) VALUES (?, ?)';

  db.query(sqlquery, newrecord, (err, result) => {
    if (err) {
      return next(err);
    }
    res.send(
      'This book is added to database, name: ' +
        name +
        ' price ' +
        numericPrice
    );
  });
});

// Export the router object so index.js can access it
module.exports = router;
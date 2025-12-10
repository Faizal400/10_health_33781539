// routes/api.js
// API routes for Bertie's Books – provides JSON access to books data

const express = require('express');
const router = express.Router();

// GET /api/books
// Returns a JSON list of books.
// Supports optional query parameters:
//   ?search=keyword        → filter by name containing keyword
//   ?minprice=5&maxprice=10 → filter by price range
//   ?sort=name|price       → sort results
router.get('/books', (req, res, next) => {
  const { search, minprice, maxprice, sort } = req.query;

  // Base query
  let sql = 'SELECT * FROM books';
  const params = [];
  const whereClauses = [];

  // Filter: search by name
  if (search && search.trim() !== '') {
    whereClauses.push('name LIKE ?');
    params.push('%' + search.trim() + '%');
  }

  // Filter: minimum price
  if (minprice && minprice !== '') {
    whereClauses.push('price >= ?');
    params.push(minprice);
  }

  // Filter: maximum price
  if (maxprice && maxprice !== '') {
    whereClauses.push('price <= ?');
    params.push(maxprice);
  }

  // Attach WHERE if any filters present
  if (whereClauses.length > 0) {
    sql += ' WHERE ' + whereClauses.join(' AND ');
  }

  // Sorting: whitelist allowed sort fields
  let orderClause = '';
  if (sort === 'name') {
    orderClause = ' ORDER BY name';
  } else if (sort === 'price') {
    orderClause = ' ORDER BY price';
  }
  sql += orderClause;

  // Execute the SQL query
  db.query(sql, params, (err, result) => {
    if (err) {
      // Return an error in JSON form & pass to Express error handler
      res.status(500).json({ error: 'Database error', details: err });
      return next(err);
    }

    // Return the books as JSON
    res.json(result);
  });
});

// Export the router object so index.js can access it
module.exports = router;

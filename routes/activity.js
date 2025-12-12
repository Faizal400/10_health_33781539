// routes/activity.js
const express = require('express');
const router = express.Router();

const redirectLogin = (req, res, next) => {
  if (!req.session.userId) {
    return res.redirect('../users/login');
  }
  next();
};

// Show activity search form
router.get('/search', redirectLogin, (req, res) => {
  res.render('activity_search.ejs');
});

// Handle activity search
router.get('/results', redirectLogin, (req, res, next) => {
  const userId = req.session.userId;
  if (!userId) {
    return res.status(400).send('No user ID in session.');
  }

  const { keyword, from_date, to_date, min_duration } = req.query;

  // Base query: only this user's activity
  let sql =
    'SELECT activity_date, activity_type, duration_minutes, intensity, notes FROM activity_logs WHERE user_id = ?';
  const params = [userId];

  // Add optional filters
  if (keyword && keyword.trim() !== '') {
    sql += ' AND activity_type LIKE ?';
    params.push('%' + keyword.trim() + '%');
  }

  if (from_date) {
    sql += ' AND activity_date >= ?';
    params.push(from_date);
  }

  if (to_date) {
    sql += ' AND activity_date <= ?';
    params.push(to_date);
  }

  if (min_duration) {
    sql += ' AND duration_minutes >= ?';
    params.push(parseInt(min_duration, 10));
  }

  sql += ' ORDER BY activity_date DESC';

  db.query(sql, params, (err, rows) => {
    if (err) return next(err);
    res.render('activity_results.ejs', { activities: rows });
  });
});

// Show “log activity” form
router.get('/add', redirectLogin, (req, res) => {
  res.render('activity_add.ejs');
});

// Handle “log activity” form submission
router.post('/added', redirectLogin, (req, res, next) => {
  // You should already be setting this in login:
  // req.session.userId = user.id;
  const userId = req.session.userId;

  if (!userId) {
    return res.status(401).send('No user ID in session. Please log in again.');
  }

  let { activity_date, activity_type, intensity, duration_minutes, notes } = req.body;

  // Basic sanity checks
  if (!activity_type || !intensity || !duration_minutes) {
    missing = ""
    missingCount = 0
     if (!activity_type) {
        missingCount +=1;
        missing = "activityType"
    }
    if (!intensity) {
        missingCount +=1;
        missing = "intensityType"
    }
    if (!duration_minutes) {
       missingCount +=1;
       missing = "minutes"
    }
    console.log(req.body);
    return res.status(400).send('Please fill in all required fields. ' + missing + ' '+ missingCount);
    
    
  }

  // Fallback: if no date was provided, use today's date (YYYY-MM-DD)
  if (!activity_date || activity_date.trim() === '') {
    const today = new Date();
    activity_date = today.toISOString().slice(0, 10);
  }

  const sql = `
    INSERT INTO activity_logs
      (user_id, activity_date, activity_type, intensity, duration_minutes, notes)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
const minutesInt = parseInt(duration_minutes, 10);
  const params = [
    userId,
    activity_date,
    activity_type,
    intensity,
    minutesInt,
    notes && notes.trim() !== '' ? notes : null,
  ];

  db.query(sql, params, (err, result) => {
    if (err) return next(err);

    res.render('activity_added.ejs', {
      activity: {
        activity_date,
        activity_type,
        intensity,
        duration_minutes: minutesInt,
        notes,
      },
    });
  });
});

// Summary of the logged-in user's activity
router.get('/summary', redirectLogin, (req, res, next) => {
  const userId = req.session.userId;

  if (!userId) {
    return res.status(401).send('No user ID in session.');
  }

  const sql = `
    SELECT 
      COUNT(*)                AS total_sessions,
      SUM(duration_minutes)   AS total_minutes,
      AVG(duration_minutes)   AS avg_minutes,
      MIN(activity_date)      AS first_date,
      MAX(activity_date)      AS last_date
    FROM activity_logs
    WHERE user_id = ?
  `;

  db.query(sql, [userId], (err, rows) => {
    if (err) {
      return next(err);
    }

    const row = rows[0] || {};

    const summary = {
      total_sessions: row.total_sessions || 0,
      total_minutes: row.total_minutes || 0,
      // 🔑 convert avg_minutes to a proper Number (or null)
      avg_minutes:
        row.avg_minutes !== null && row.avg_minutes !== undefined
          ? Number(row.avg_minutes)
          : null,
      first_date: row.first_date || null,
      last_date: row.last_date || null,
    };

    return res.render('activity_summary.ejs', { summary });
  });
});


module.exports = router;
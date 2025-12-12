// routes/metrics.js
const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');

// Same style as your other redirectLogin helpers
const redirectLogin = (req, res, next) => {
  if (!req.session || !req.session.userId) {
    return res.redirect('/users/login');
  }
  next();
};

// GET /metrics/bodymeasurements
// Show body measurement history for the currently logged-in user
router.get('/bodymeasurements', redirectLogin, (req, res, next) => {
  const userId = req.session.userId;

  if (!userId) {
    return res.redirect('/users/login');
  }

  const sql = `
    SELECT
      entry_date,
      weight_kg,
      systolic_bp,
      diastolic_bp,
      resting_hr,
      notes
    FROM health_entries
    WHERE user_id = ?
    ORDER BY entry_date DESC, id DESC
  `;
  
  db.query(sql, [userId], (err, rows) => {
    if (err) return next(err);
    res.render('metrics_list.ejs', { measurements: rows });
  });
});

// GET /metrics/add
// Show form to log new body measurements
router.get('/add', redirectLogin, (req, res) => {
  res.render('metrics_add.ejs', { errors: [], formData: {} });
});

// POST /metrics/add
// Validate, compute BMI, store in DB, then show confirmation
router.post(
  '/add',
  redirectLogin,
  [
    // Match the form field name: "recorded_at"
    body('recorded_at')
      .notEmpty().withMessage('Please choose a date.')
      .isISO8601().withMessage('Date must be a valid date.'),

    body('height_cm')
      .optional({ checkFalsy: true })
      .isFloat({ min: 50, max: 250 })
      .withMessage('Height should be between 50cm and 250cm.'),

    body('weight_kg')
      .optional({ checkFalsy: true })
      .isFloat({ min: 20, max: 500 })
      .withMessage('Weight should be between 20kg and 500kg.'),

    body('resting_hr')
      .optional({ checkFalsy: true })
      .isInt({ min: 30, max: 220 })
      .withMessage('Resting heart rate should be between 30 and 220 bpm.'),

    body('systolic_bp')
      .optional({ checkFalsy: true })
      .isInt({ min: 70, max: 250 })
      .withMessage('Systolic BP should be between 70 and 250.'),

    body('diastolic_bp')
      .optional({ checkFalsy: true })
      .isInt({ min: 40, max: 150 })
      .withMessage('Diastolic BP should be between 40 and 150.'),

    body('notes')
      .optional({ checkFalsy: true })
      .isLength({ max: 255 })
      .withMessage('Notes must be at most 255 characters.')
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    const {
      recorded_at,
      height_cm,
      weight_kg,
      resting_hr,
      systolic_bp,
      diastolic_bp,
      notes
    } = req.body;

    if (!errors.isEmpty()) {
      return res.status(400).render('metrics_add.ejs', {
        errors: errors.array(),
        formData: req.body
      });
    }

    // Map recorded_at (from form) to measurement_date (DB column)
    const measurement_date = recorded_at;

    // Compute BMI if height and weight are provided
    const h = parseFloat(height_cm);
    const w = parseFloat(weight_kg);
    let bmi = null;

    if (!isNaN(h) && !isNaN(w) && h > 0) {
      const meters = h / 100.0;
      bmi = w / (meters * meters);
    }

    // ✅ Insert ONLY the columns that actually exist in health_entries
    const sql = `
      INSERT INTO health_entries
        (user_id, entry_date, weight_kg,
         systolic_bp, diastolic_bp, resting_hr, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      req.session.userId,          // numeric user id already in session
      recorded_at,                 // required & validated date from form
      weight_kg || null,
      systolic_bp || null,
      diastolic_bp || null,
      resting_hr || null,
      notes || null
    ];

    db.query(sql, params, (err2, result) => {
      if (err2) return next(err2);

      // We STILL pass bmi to the view for display purposes,
      // even though we don't store it in the DB
      res.render('metrics_added.ejs', {
        measurement: {
          recorded_at,
          height_cm,
          weight_kg,
          bmi,
          resting_hr,
          systolic_bp,
          diastolic_bp,
          notes
        }
      });
    });
  }
);

router.post('/added', redirectLogin, (req, res, next) => {
  const userId = req.session.userId;
  if (!userId) {
    return res.redirect('/users/login');
  }

  const {
    measurement_date,
    weight_kg,
    height_cm,
    waist_cm,
    body_fat_percent
  } = req.body;

  // We do NOT insert recorded_at – the table has created_at with a default
  const sql = `
    INSERT INTO body_metrics
      (user_id, measurement_date, weight_kg, height_cm, waist_cm, body_fat_percent)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  const params = [
    userId,
    measurement_date || null,
    weight_kg || null,
    height_cm || null,
    waist_cm || null,
    body_fat_percent || null
  ];

  db.query(sql, params, (err, result) => {
    if (err) return next(err);

    // Just echo back what the user entered
    res.render('metrics_added.ejs', {
      measurement: {
        measurement_date,
        weight_kg,
        height_cm,
        waist_cm,
        body_fat_percent
      }
    });
  });
});

module.exports = router;
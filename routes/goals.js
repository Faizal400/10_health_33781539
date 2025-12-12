// routes/goals.js
const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');

// Require login for goals pages
const redirectLogin = (req, res, next) => {
  if (!req.session || !req.session.userId) {
    return res.redirect('../users/login');
  }
  next();
};

// GET /goals -> view all goals for current user
router.get('/', redirectLogin, (req, res, next) => {
  const userId = req.session.userId;

  const sql = `
    SELECT
      id,
      title,
      description,
      metric,
      target_value,
      current_value,
      deadline,
      is_completed,
      created_at
    FROM goals
    WHERE user_id = ?
    ORDER BY deadline IS NULL, deadline ASC, created_at DESC
  `;

  db.query(sql, [userId], (err, rows) => {
    if (err) return next(err);
    res.render('goals_list.ejs', { goals: rows });
  });
});

// GET /goals/edit -> show form to create a goal
router.get('/edit', redirectLogin, (req, res) => {
  res.render('goals_add.ejs', {
    errors: [],
    formData: {}
  });
});

// POST /goals/edit -> validate + insert a new goal
router.post(
  '/edit',
  redirectLogin,
  [
    body('title')
      .notEmpty().withMessage('Title is required.')
      .isLength({ max: 100 }).withMessage('Title must be at most 100 characters.'),

    body('description')
      .optional({ checkFalsy: true })
      .isLength({ max: 500 }).withMessage('Description must be at most 500 characters.'),

    body('metric')
      .optional({ checkFalsy: true })
      .isLength({ max: 50 }).withMessage('Metric must be at most 50 characters.'),

    body('target_value')
      .optional({ checkFalsy: true })
      .isFloat({ min: 0 }).withMessage('Target value must be a positive number.'),

    body('current_value')
      .optional({ checkFalsy: true })
      .isFloat({ min: 0 }).withMessage('Current value must be a positive number.'),

    body('deadline')
      .optional({ checkFalsy: true })
      .isISO8601().withMessage('Deadline must be a valid date (YYYY-MM-DD).'),

    body('is_completed')
      .optional({ checkFalsy: true })
      .isIn(['0', '1']).withMessage('Completion must be 0 or 1.')
  ],
  (req, res, next) => {
    const errors = validationResult(req);

  
    const {
      title,
      description,
      metric,
      target_value,
      current_value,
      deadline,
      is_completed
    } = req.body;

    if (!errors.isEmpty()) {
      return res.status(400).render('goals_add.ejs', {
        errors: errors.array(),
        formData: req.body
      });
    }

    const sql = `
      INSERT INTO goals
        (user_id, title, description, metric, target_value, current_value, deadline, is_completed)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      req.session.userId,
      title,
      description || null,
      metric || null,
      target_value === '' || target_value === undefined ? null : target_value,
      current_value === '' || current_value === undefined ? null : current_value,
      deadline || null,
      is_completed ? 1 : 0
    ];

    db.query(sql, params, (err2, result) => {
      if (err2) return next(err2);

      res.render('goals_added.ejs', {
        goal: {
          title,
          description: description || '',
          metric: metric || '',
          target_value: target_value || '',
          current_value: current_value || '',
          deadline: deadline || '',
          is_completed: is_completed ? 1 : 0
        }
      });
    });
  }
);

module.exports = router;
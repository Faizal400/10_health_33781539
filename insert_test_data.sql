USE health;

-- Optional: clear existing data (useful while developing)
DELETE FROM activity_logs;
DELETE FROM goals;
DELETE FROM health_entries;
DELETE FROM health_profiles;
DELETE FROM audit_log;
DELETE FROM users;

-- Default user for marking: gold / smiths
-- Hash is bcrypt( 'smiths' ) with 10 salt rounds (same as Bertie's Books)
INSERT INTO users (username, first, last, email, password_hash, role)
VALUES
(
  'gold',
  'Gold',
  'User',
  'gold@smiths.com',
  '$2b$10$f6fY8G0ke8mk5K8Ccjka9Ovu/sRLQ.NerZ0mXgMmpM.qgdxMEjskK',
  'user'
);

-- Health profile for gold
INSERT INTO health_profiles (user_id, height_cm, date_of_birth, sex)
SELECT id, 175.0, '2004-10-12', 'M'
FROM users
WHERE username = 'gold';

-- A couple of health entries for gold
INSERT INTO health_entries (user_id, entry_date, weight_kg, systolic_bp, diastolic_bp, resting_hr, notes)
SELECT id, '2025-01-01', 75.0, 120, 80, 65, 'Baseline reading'
FROM users
WHERE username = 'gold';

INSERT INTO health_entries (user_id, entry_date, weight_kg, systolic_bp, diastolic_bp, resting_hr, notes)
SELECT id, '2025-01-15', 74.2, 118, 78, 63, 'Slight improvement'
FROM users
WHERE username = 'gold';

-- A couple of goals for gold
INSERT INTO goals (user_id, title, description, metric, target_value, current_value, deadline, is_completed)
SELECT id,
       'Reach 72kg',
       'Gradual weight reduction with healthy diet + walking',
       'weight_kg',
       72.0,
       74.2,
       '2025-03-31',
       0
FROM users
WHERE username = 'gold';

INSERT INTO goals (user_id, title, description, metric, target_value, current_value, deadline, is_completed)
SELECT id,
       'Walk 8,000 steps/day',
       'Consistently hit 8k steps for at least a month',
       'steps_per_day',
       8000,
       6500,
       '2025-04-30',
       0
FROM users
WHERE username = 'gold';

-- Sample activity logs for gold
INSERT INTO activity_logs (user_id, activity_date, activity_type, duration_minutes, intensity, notes)
SELECT id, '2025-01-10', 'Brisk walk', 30, 'medium', 'Evening walk around the park'
FROM users
WHERE username = 'gold';

INSERT INTO activity_logs (user_id, activity_date, activity_type, duration_minutes, intensity, notes)
SELECT id, '2025-01-12', 'Indoor cycling', 20, 'high', 'Short but intense session'
FROM users
WHERE username = 'gold';
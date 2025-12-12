# Health & Activity Tracker – Final Lab

> *Dynamic Web Applications – Final Coursework Submission*

A secure, session-based **health and activity tracking web application**, built using **Node.js**, **Express**, **EJS**, and **MySQL**.

This application allows users to:
- Register and log in securely
- Record physical activities
- View summaries of their activity history
- Record personal health metrics (e.g. weight, blood pressure)
- Set and manage personal health goals
- View **only their own data** (per-user data isolation)

---

## Author Information

**Name:** Faizal Ali  
**Student ID:** 33781539  
**Module:** Dynamic Web Applications  
**Final Lab Submission**

---

## 1. Overview

This application is a continuation and extension of Labs **6–9**, combining:

- Database-backed data persistence (MySQL)
- Secure authentication and authorisation
- Session-based access control
- Input validation and sanitisation
- Per-user data visibility
- Clear separation of concerns (routes, views, DB)
- Production-ready install and deployment scripts

The system is designed so that **each user can only view and manage their own health data**, satisfying both security and privacy expectations.

---

## 2. Key Features

### User Accounts & Security
- Secure registration and login using **bcryptjs**
- Passwords are **never stored in plaintext**
- Session management via `express-session`
- Login audit log recording:
  - username
  - success/failure
  - timestamp
  - IP address
  - user agent

### Activity Tracking
- Log physical activities (type, duration, intensity, notes)
- Search activities by keyword
- View activity summaries:
  - total sessions
  - total minutes
  - average duration
  - first & most recent activity

### Health Metrics
- Record body measurements (height, weight, HR, BP)
- Automatic BMI calculation
- View historical measurement entries
- Data scoped strictly to the logged-in user

### Health Goals
- Create personal health goals
- Set targets, deadlines, notes
- View goals list with completion status
- Goals are linked to individual users

---

## 3. Folder Structure

```text
10_health_33781539/
├── node_modules/
├── public/
│   └── main.css
├── routes/
│   ├── main.js
│   ├── users.js
│   ├── activity.js
│   ├── metrics.js
│   └── goals.js
├── views/
│   ├── index.ejs
│   ├── about.ejs
│   ├── login.ejs
│   ├── register.ejs
│   ├── users_list.ejs
│   ├── audit.ejs
│   ├── activity_add.ejs
│   ├── activity_added.ejs
│   ├── activity_search.ejs
│   ├── activity_results.ejs
│   ├── activity_summary.ejs
│   ├── metrics_add.ejs
│   ├── metrics_added.ejs
│   ├── metrics_list.ejs
│   ├── goals_add.ejs
│   ├── goals_added.ejs
│   └── goals_list.ejs
├── create_db.sql
├── insert_test_data.sql
├── index.js
├── package.json
├── .env
├── README.md
├── report.md
└── links.txt
```
## 4. Access Control

The following routes require a logged-in user:

- `/activity/*`
- `/metrics/*`
- `/goals/*`
- `/users/list`
- `/users/audit`
- `/logout`

Access control is implemented via a reusable `redirectLogin` middleware which checks for a valid session.

## 5. Validation & Sanitisation
User input is validated and sanitised using:
- express-validator
- Server-side checks (length, format, required fields)
- Sanitisation of text fields to prevent XSS

Examples:
> - Email format validation
> - Password minimum length
> - Numeric bounds for health metrics
> - Date format validation (ISO 8601)

## 6. Database Setup
Creating the Database
```MySQL
source create_db.sql;
source insert_test_data.sql;
```

This will create:
- `users`
- `activity_logs`
- `health_entries`
- `health_profiles`
- `goals`
- `audit_log`

Default Marker Account
```text
Username: gold
Password: smiths
```
> The password is stored as a bcrypt hash and works immediately after installation.

## 7. Installation & Running
Install dependencies
```cmd
npm install
```

Run the application
```cmd
node index.js
```

The app runs on:
http://localhost:8000

## 8. Dependencies

**__Core__**
express
ejs
mysql2
dotenv

**__Security:__**
- bcryptjs
- express-session
- express-validator
- express-sanitizer

## 9. Notes for Markers
- Application installs cleanly with npm install
- Database builds from scratch via SQL scripts
- All required test data is inserted automatically
- No hard-coded credentials - but there is a default user "gold" with password "smiths" as requested.
- Per-user data isolation enforced at query level
- All pages accessible via homepage navigation
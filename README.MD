# Berties Books – Lab 9  
> *A continuation of Lab 6, Lab 7, & Lab 8*

Sample code for **Dynamic Web Applications** module.

Uses **Node.js** with **Express**, **EJS**, **MySQL2**, **request**, **bcryptjs**, **express-session**,  
`express-validator`, `dotenv`, etc.

**Author:** Faizal Ali  
**Student ID:** 33781539  
**Lab 9: Calling APIs (9a) & Providing APIs (9b)**

---

## 1. Overview

This lab extends the earlier Bertie’s Books project by introducing **API consumption** (weather)  
and **API provision** (our own `/api/books` endpoint).

By the end of Lab 9, the application includes:

### **Lab 9a – Calling APIs**
- Weather forecast feature at `/weather`
- API call using the `request` module  
- Human-friendly weather display (temperature, humidity, wind, etc.)
- Dynamic city lookup using a form
- Error handling for invalid locations
- Weather link added to homepage
- API key stored securely using `.env`

### **Lab 9b – Providing APIs**
- New `/api/books` endpoint returning JSON  
- API can filter by:
  - **Search keyword** (`?search=word`)
  - **Price range** (`?minprice=x&maxprice=y`)
  - **Sorting** (`?sort=name` or `?sort=price`)
- API publicly available (no authentication required)
- Fully deployed on VM and runnable via `forever`
- `links.txt` included for marking

### Security features carried forward from earlier labs:
- Password hashing (`bcryptjs`)
- Session-based login & protected routes
- Input validation and sanitisation (`express-validator`)
- Audit logging for login attempts  
- Sanitised + validated registration inputs  
- Secure environment variables via `.env`

---

## 2. Folder Structure

```text
berties-books/
├── node_modules/
├── public/
│   └── main.css
├── routes/
│   ├── books.js
│   ├── main.js
│   ├── users.js
│   └── weather.js         # NEW – Lab 9a
│   └── api.js             # NEW – Lab 9b
├── views/
│   ├── about.ejs
│   ├── addbook.ejs
│   ├── audit.ejs
│   ├── index.ejs
│   ├── list.ejs
│   ├── login.ejs
│   ├── register.ejs
│   ├── search.ejs
│   ├── search_results.ejs
│   ├── users_list.ejs
│   └── weather.ejs        # NEW – Lab 9a
├── create_db.sql
├── insert_test_data.sql
├── index.js
├── package.json
├── .env
└── README.md
```
---

## 3. Routes Overview

| Route                  | Method | Purpose                                |
| ---------------------- | ------ | -------------------------------------- |
| `/`                    | GET    | Home page                              |
| `/about`               | GET    | About page                             |
| `/books/search`        | GET    | Search books                           |
| `/books/search-result` | GET    | Search results                         |
| `/books/list`          | GET    | List all books                         |
| `/books/addbook`       | GET    | Add book form                          |
| `/books/bookadded`     | POST   | Insert new book                        |
| `/users/register`      | GET    | Registration form                      |
| `/users/registered`    | POST   | Register user                          |
| `/users/login`         | GET    | Login form                             |
| `/users/loggedin`      | POST   | Verify credentials                     |
| `/users/list`          | GET    | List users                             |
| `/users/audit`         | GET    | View audit logs                        |
| `/weather`             | GET    | Weather search form + results (Lab 9a) |
| `/api/books`           | GET    | JSON API for books (Lab 9b)            |


### Routes protected by session (redirectLogin):

**Books**
- `GET /books/list`
- `GET /books/addbook`
- `POST /books/bookadded`

**Users**
- `GET /users/list`
- `GET /users/audit`

**Main**
- `GET /logout`

---

## 4. Audit logging
Every login attempt is recorded:

| Field      | Description               |
| ---------- | ------------------------- |
| username   | Username attempted        |
| success    | 1 (success) or 0 (failed) |
| message    | Explanation               |
| ip_address | IP of the client          |
| user_agent | Browser/device details    |
| created_at | Timestamp                 |

## Default login (required for marking)

Inserted via ```insert_test_data.sql```:
```makefile
Username: gold
Password: smiths
```
Password is inserted as a correct bcryptjs hash.

---

## 5. Weather API (Lab 9a)
Features implemented:
- Uses OpenWeatherMap API
- API key stored in .env
- Uses the required request module
- Supports:
  - Default weather view
  - City search form
  - Human-readable weather output
  - Extra weather info (wind speed, humidity)
  - Full error handling for invalid cities

## 6. ### Base Endpoint (no filters)
Returns all books.

Search parameter
> `/api/books?search=world`

Price range
> `/api/books?minprice=5&maxprice=20`

Sorting
> `/api/books?sort=name`
> `/api/books?sort=price`

**API Design Notes**
- Does not require login (per marking instructions)
- Returns JSON only
- Validated + sanitised parameters before querying database
- Fully error-handled (invalid price ranges, empty results, etc.)

## Setup

### Database setup

**__1️. Create Database__**
Run inside MySQL:
```sql
source create_db.sql;
source insert_test_data.sql;
```
This creates:
- `berties_books`
- `books`
- `users`
- `audit_log`
Application database user

And includes:
- `5 book entries`
- Default user gold / smiths (bcrypt hashed)

**__2. Verify__**
```sql
USE berties_books;
SELECT * FROM books;
```
---

### Running the app
```cmd
npm install
npm install express ejs mysql2 bcryptjs dotenv express-session request express-validator express-sanitizer
node index.js
```
### Full list of dependencies used:
**Core**
- express – web framework
- ejs – templating engine
- mysql2 – MySQL client
- dotenv – loads `.env` variables
- express-session - ensures security & removes ability to enter certain links without being logged in
**Security**
- bcryptjs – password hashing
(Older bcrypt versions seem to incompatible or not work with the Goldsmiths VM)

---

**To access locally:** http://localhost:8000/

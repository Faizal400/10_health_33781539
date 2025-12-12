-- Create database script for Health app

-- Drop + recreate if you want a clean start (optional in coursework)
-- DROP DATABASE IF EXISTS health;

CREATE DATABASE IF NOT EXISTS health;
USE health;

-- Users table (auth)
CREATE TABLE IF NOT EXISTS users (
    id INT NOT NULL AUTO_INCREMENT,
    username VARCHAR(100) NOT NULL UNIQUE,
    first VARCHAR(100) NOT NULL,
    last VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('user','admin') NOT NULL DEFAULT 'user',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);

-- Health profile (one per user)
CREATE TABLE IF NOT EXISTS health_profiles (
    id INT NOT NULL AUTO_INCREMENT,
    user_id INT NOT NULL,
    height_cm DECIMAL(5,2) NULL,
    date_of_birth DATE NULL,
    sex ENUM('M','F','Other') DEFAULT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_profile_user
      FOREIGN KEY (user_id) REFERENCES users(id)
      ON DELETE CASCADE
);

-- Daily / periodic health entries (weight, BP, etc.)
CREATE TABLE IF NOT EXISTS health_entries (
    id INT NOT NULL AUTO_INCREMENT,
    user_id INT NOT NULL,
    entry_date DATE NOT NULL,
    weight_kg DECIMAL(5,2) NULL,
    systolic_bp INT NULL,
    diastolic_bp INT NULL,
    resting_hr INT NULL,
    notes VARCHAR(500) NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_entry_user
      FOREIGN KEY (user_id) REFERENCES users(id)
      ON DELETE CASCADE
);

-- Goals (e.g., weight, steps, BP targets)
CREATE TABLE IF NOT EXISTS goals (
    id INT NOT NULL AUTO_INCREMENT,
    user_id INT NOT NULL,
    title VARCHAR(100) NOT NULL,
    description VARCHAR(500) NULL,
    metric VARCHAR(50) NULL,
    target_value DECIMAL(10,2) NULL,
    current_value DECIMAL(10,2) NULL,
    deadline DATE NULL,
    is_completed BOOLEAN NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_goal_user
      FOREIGN KEY (user_id) REFERENCES users(id)
      ON DELETE CASCADE
);

-- Activity logs (exercise / movement)
CREATE TABLE IF NOT EXISTS activity_logs (
    id INT NOT NULL AUTO_INCREMENT,
    user_id INT NOT NULL,
    activity_date DATE NOT NULL,
    activity_type VARCHAR(100) NOT NULL,
    duration_minutes INT NULL,
    intensity ENUM('low','medium','high') DEFAULT 'medium',
    notes VARCHAR(500) NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_activity_user
      FOREIGN KEY (user_id) REFERENCES users(id)
      ON DELETE CASCADE
);

-- Login / security audit
CREATE TABLE IF NOT EXISTS audit_log (
    id INT NOT NULL AUTO_INCREMENT,
    username VARCHAR(100) NOT NULL,
    success BOOLEAN NOT NULL,
    message VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45) NULL,
    user_agent VARCHAR(255) NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);

-- Body metrics
CREATE TABLE IF NOT EXISTS body_metrics (
  id INT NOT NULL AUTO_INCREMENT,
  user_id INT NOT NULL,
  measurement_date DATE NOT NULL,
  weight_kg DECIMAL(5,2),
  height_cm DECIMAL(5,2),
  waist_cm DECIMAL(5,2),
  body_fat_percent DECIMAL(5,2),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_body_metrics_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
);

-- Application DB user for the health app (adjust name / password to match your .env)
CREATE USER IF NOT EXISTS 'health_app'@'localhost' IDENTIFIED BY 'qwertyuiop';
GRANT ALL PRIVILEGES ON health.* TO 'health_app'@'localhost';
FLUSH PRIVILEGES;
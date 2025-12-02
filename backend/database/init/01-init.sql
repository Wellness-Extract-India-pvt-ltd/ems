-- EMS Database Initialization Script
-- This script creates the initial database structure

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS ems_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Use the database
USE ems_db;

-- Create user if it doesn't exist
CREATE USER IF NOT EXISTS 'ems_user'@'%' IDENTIFIED BY 'ems_password';
GRANT ALL PRIVILEGES ON ems_db.* TO 'ems_user'@'%';
FLUSH PRIVILEGES;

-- Set timezone
SET time_zone = '+00:00';

# EMS MySQL Migration Guide

This document outlines the migration from MongoDB Atlas to MySQL running in a Docker container for the EMS (Employee Management System) backend.

## Overview

The migration involves:
- Replacing MongoDB/Mongoose with MySQL/Sequelize
- Converting nested MongoDB schemas to normalized MySQL tables
- Setting up Docker container for MySQL
- Updating all models and database connections

## Prerequisites

- Docker Desktop installed and running
- Node.js and npm installed
- Existing EMS backend codebase

## Quick Start

### 1. Start MySQL Container

**Windows (PowerShell):**
```powershell
.\start-mysql.ps1
```

**Windows (Command Prompt):**
```cmd
start-mysql.bat
```

**Manual Docker Commands:**
```bash
docker-compose up -d mysql
```

### 2. Install Dependencies

```bash
cd backend
npm install
```

### 3. Environment Configuration

Copy the environment variables from `backend/env.example` to your `.env` file:

```bash
# Database Configuration (MySQL)
DB_HOST=localhost
DB_PORT=3306
DB_NAME=ems_db
DB_USER=ems_user
DB_PASSWORD=ems_password

# MySQL Root Password (for Docker)
MYSQL_ROOT_PASSWORD=ems_root_password
```

### 4. Start the Backend Server

```bash
cd backend
npm run dev
```

## Database Structure

### Main Tables

1. **departments** - Department information
2. **employees** - Employee main information
3. **employee_educations** - Employee education records
4. **employee_organizations** - Employee work experience
5. **tickets** - Support tickets
6. **ticket_attachments** - Ticket file attachments
7. **ticket_comments** - Ticket comments
8. **ticket_events** - Ticket change history

### Key Changes from MongoDB

- **Nested Schemas**: MongoDB nested objects (personal, contact, employment) are now separate columns in the main employees table
- **Arrays**: MongoDB arrays (educations, organizations) are now separate tables with foreign keys
- **ObjectId References**: MongoDB ObjectId references are now integer foreign keys
- **Timestamps**: MongoDB automatic timestamps are now MySQL DATETIME columns

## Docker Services

The `docker-compose.yml` includes:

- **MySQL 8.0**: Main database server
- **phpMyAdmin**: Web-based MySQL administration tool (http://localhost:8080)

## Database Access

### Connection Details
- **Host**: localhost
- **Port**: 3306
- **Database**: ems_db
- **Username**: ems_user
- **Password**: ems_password

### phpMyAdmin
- **URL**: http://localhost:8080
- **Username**: ems_user
- **Password**: ems_password

## Model Changes

### Employee Model
- Flattened nested schemas into main table columns
- Separate tables for education and organization history
- Integer IDs instead of MongoDB ObjectIds

### Ticket Model
- Separate tables for attachments, comments, and events
- JSON field for tags (MySQL 5.7+)
- Proper foreign key relationships

### Department Model
- Self-referencing foreign keys for parent departments
- Integer IDs with proper associations

## Migration Notes

### Data Migration
If you have existing MongoDB data, you'll need to:
1. Export data from MongoDB
2. Transform the data structure
3. Import into MySQL tables

### API Compatibility
The API endpoints should remain the same, but the underlying data structure has changed. Controllers may need updates to handle the new Sequelize models.

## Troubleshooting

### Common Issues

1. **Docker not running**: Ensure Docker Desktop is started
2. **Port conflicts**: Check if ports 3306 or 8080 are already in use
3. **Connection refused**: Wait for MySQL container to fully start (10-15 seconds)
4. **Permission denied**: Ensure Docker has proper permissions

### Useful Commands

```bash
# Check container status
docker-compose ps

# View container logs
docker-compose logs mysql

# Stop containers
docker-compose down

# Remove volumes (WARNING: This will delete all data)
docker-compose down -v
```

## Next Steps

1. Update controllers to use Sequelize models
2. Test all API endpoints
3. Migrate existing data if needed
4. Update frontend if any data structure changes affect the API responses

## Support

For issues with this migration, check:
- Docker logs: `docker-compose logs mysql`
- Backend logs: Check the `logs/` directory
- Database connection: Test with phpMyAdmin

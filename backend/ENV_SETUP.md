# Environment Setup Guide

## Overview

This guide helps you set up the environment configuration for the EMS Backend application.

## Quick Setup

### 1. Create Environment File

```bash
# Copy the example file to create your .env file
cp env.example .env

# Or use the automated setup script
node setup-env.js
```

### 2. Update Required Variables

Edit the `.env` file and update the following variables with your actual values:

#### Azure AD Configuration

```env
CLIENT_ID=your_azure_client_id
CLIENT_SECRET=your_azure_client_secret
TENANT_ID=your_azure_tenant_id
```

#### Database Configuration

```env
DB_PASSWORD=your_mysql_password
```

#### BioMetrics Configuration

```env
BIOMETRICS_USER=your_biometrics_username
BIOMETRICS_PASSWORD=your_biometrics_password
```

#### Email Configuration (Optional)

```env
SENDGRID_API_KEY=your_sendgrid_api_key
EMAIL_FROM=noreply@yourcompany.com
```

## Docker Setup

### 1. Create Root Environment File

For Docker setup, create a `.env` file in the project root (same level as `docker-compose.yml`):

```bash
# In project root
touch .env
```

### 2. Add Docker Environment Variables

```env
# Database Configuration
MYSQL_ROOT_PASSWORD=ems_root_password
MYSQL_DATABASE=ems_db
MYSQL_USER=ems_user
MYSQL_PASSWORD=ems_password

# Redis Configuration
REDIS_PASSWORD=ems_redis_password

# Azure AD Configuration
CLIENT_ID=your_azure_client_id
CLIENT_SECRET=your_azure_client_secret
TENANT_ID=your_azure_tenant_id

# BioMetrics Configuration
BIOMETRICS_USER=your_biometrics_username
BIOMETRICS_PASSWORD=your_biometrics_password
```

## Security Best Practices

### 1. Never Commit .env Files

```bash
# Ensure .env is in .gitignore
echo ".env" >> .gitignore
echo "*.env" >> .gitignore
```

### 2. Use Strong Secrets

- Generate strong, random passwords
- Use at least 64 characters for JWT secrets
- Rotate secrets regularly in production

### 3. Environment-Specific Configuration

- Use different values for development, staging, and production
- Never use production secrets in development

## Validation

### Check Configuration

```bash
# Validate your .env file
node setup-env.js
```

### Test Database Connection

```bash
# Test MySQL connection
npm run test:db

# Test BioMetrics connection
npm run test:biometrics
```

## Troubleshooting

### Common Issues

1. **Missing .env file**
   - Error: `Cannot find module './config'`
   - Solution: Create .env file using `cp env.example .env`

2. **Invalid JWT secrets**
   - Error: `JWT_SECRET is required`
   - Solution: Update JWT_SECRET and JWT_REFRESH_SECRET in .env

3. **Database connection failed**
   - Error: `Connection refused`
   - Solution: Check DB_HOST, DB_PORT, DB_USER, DB_PASSWORD

4. **Azure AD authentication failed**
   - Error: `Invalid client credentials`
   - Solution: Verify CLIENT_ID, CLIENT_SECRET, TENANT_ID

### Environment Variables Reference

| Variable              | Required | Description            | Default      |
| --------------------- | -------- | ---------------------- | ------------ |
| `PORT`                | No       | Server port            | 5000         |
| `NODE_ENV`            | No       | Environment mode       | development  |
| `DB_HOST`             | No       | MySQL host             | localhost    |
| `DB_PORT`             | No       | MySQL port             | 3306         |
| `DB_USER`             | No       | MySQL username         | root         |
| `DB_PASSWORD`         | **Yes**  | MySQL password         | -            |
| `DB_NAME`             | No       | MySQL database name    | ems_db       |
| `JWT_SECRET`          | **Yes**  | JWT signing secret     | -            |
| `JWT_REFRESH_SECRET`  | **Yes**  | JWT refresh secret     | -            |
| `CLIENT_ID`           | **Yes**  | Azure AD client ID     | -            |
| `CLIENT_SECRET`       | **Yes**  | Azure AD client secret | -            |
| `TENANT_ID`           | **Yes**  | Azure AD tenant ID     | -            |
| `REDIS_HOST`          | No       | Redis host             | localhost    |
| `REDIS_PORT`          | No       | Redis port             | 6379         |
| `REDIS_PASSWORD`      | No       | Redis password         | -            |
| `BIOMETRICS_SERVER`   | No       | BioMetrics server      | 172.16.1.171 |
| `BIOMETRICS_DATABASE` | No       | BioMetrics database    | ONtime_Att   |
| `BIOMETRICS_PORT`     | No       | BioMetrics port        | 1433         |
| `BIOMETRICS_USER`     | **Yes**  | BioMetrics username    | -            |
| `BIOMETRICS_PASSWORD` | **Yes**  | BioMetrics password    | -            |

## Support

For additional help:

1. Check the main README.md
2. Review the logs in the `logs/` directory
3. Verify all required environment variables are set
4. Ensure all external services (MySQL, Redis, BioMetrics) are accessible

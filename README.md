# MyWellness EMS & Asset Management System

A modern Employee Management System (EMS) and Asset Management platform built with Node.js, Express, MySQL, and React. This project supports employee onboarding, asset tracking, license management, ticketing, integrations, biometric attendance, and more.

---

## Table of Contents

- [Features](#features)
- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Environment Variables](#environment-variables)
  - [Installation](#installation)
  - [Running the Application](#running-the-application)
- [Docker Setup](#docker-setup)
- [Scripts](#scripts)
- [API Overview](#api-overview)
- [Frontend Overview](#frontend-overview)
- [Authentication](#authentication)
- [Biometric Integration](#biometric-integration)
- [Logging & Audit](#logging--audit)
- [Contributing](#contributing)
- [License](#license)

---

## Features

- **Employee Management**: Complete employee lifecycle management with onboarding, profiles, and role-based access
- **Asset Management**: Hardware and software asset tracking with assignment and maintenance
- **License Management**: Software license tracking and assignment to employees
- **Ticketing System**: Support ticket management with status tracking
- **Biometric Integration**: Real-time attendance tracking from biometric devices
- **Microsoft Azure AD Integration**: Single Sign-On (SSO) authentication
- **Role-based Access Control**: Admin, manager, and employee roles with granular permissions
- **Audit Logs**: Comprehensive activity tracking and logging
- **File Uploads**: Document management for employee records and assets
- **Responsive UI**: Modern, mobile-friendly interface with React & Tailwind CSS

---

## Project Structure

```
.
├── backend/
│   ├── app.js                 # Express application setup
│   ├── config.js              # Configuration management
│   ├── index.js               # Server entry point
│   ├── package.json
│   ├── .env                   # Environment variables
│   ├── Dockerfile             # Production Docker image
│   ├── Dockerfile.dev         # Development Docker image
│   ├── controllers/           # Route controllers
│   │   ├── authController.js
│   │   ├── employeeController.js
│   │   ├── biometricsController.js
│   │   ├── hardwareController.js
│   │   ├── softwareController.js
│   │   ├── licenseController.js
│   │   ├── ticketController.js
│   │   └── integrationController.js
│   ├── models/                # Sequelize database models
│   │   ├── Employee.js
│   │   ├── Hardware.js
│   │   ├── Software.js
│   │   ├── License.js
│   │   ├── Ticket.js
│   │   ├── UserRoleMap.js
│   │   ├── BiometricEmployee.js
│   │   └── BiometricAttendance.js
│   ├── routes/                # API route definitions
│   │   ├── index.js
│   │   ├── authRoutes.js
│   │   ├── employeeRoutes.js
│   │   ├── biometricsRoutes.js
│   │   ├── hardwareRoutes.js
│   │   ├── softwareRoutes.js
│   │   ├── licenseRoutes.js
│   │   ├── ticketRoutes.js
│   │   └── integrationRoutes.js
│   ├── middleware/            # Express middleware
│   │   ├── authMiddleware.js
│   │   ├── validateRequest.js
│   │   ├── rateLimiter.js
│   │   └── validators/
│   ├── database/              # Database connections
│   │   ├── connection.js      # MySQL connection
│   │   └── biometricsConnection.js  # SQL Server connection
│   ├── utils/                 # Utility functions
│   │   ├── logger.js
│   │   ├── msalConfig.js
│   │   ├── msgraph.js
│   │   └── graphService.js
│   ├── uploads/               # File upload storage
│   └── logs/                  # Application logs
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── eslint.config.js
│   ├── Dockerfile             # Production Docker image
│   ├── Dockerfile.dev         # Development Docker image
│   ├── nginx.conf             # Nginx configuration
│   └── src/
│       ├── main.jsx           # React entry point
│       ├── components/        # Reusable UI components
│       │   ├── Assets/
│       │   ├── Employees/
│       │   ├── Software/
│       │   ├── Licenses/
│       │   ├── Dashboard/
│       │   └── ...
│       ├── pages/             # Page components
│       │   ├── Dashboard.jsx
│       │   ├── EmployeePage.jsx
│       │   ├── AssetsPage.jsx
│       │   ├── SoftwarePage.jsx
│       │   └── ...
│       ├── store/             # Redux store and slices
│       │   ├── index.js
│       │   └── slices/
│       ├── auth/              # Authentication components
│       │   ├── context/
│       │   ├── components/
│       │   └── routes/
│       ├── api/               # API client configuration
│       ├── assets/            # Static assets
│       ├── constants/         # Application constants
│       ├── layouts/           # Layout components
│       └── routes/            # React Router configuration
├── docker-compose.yml         # Docker Compose configuration
├── docker-compose.prod.yml    # Production Docker Compose
├── scripts/                   # Setup and utility scripts
├── Makefile                   # Build automation
└── README.md
```

---

## Tech Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MySQL 8.0 (primary), SQL Server (biometric data)
- **ORM**: Sequelize
- **Authentication**: JWT, Microsoft MSAL
- **Queue**: BullMQ with Redis
- **Logging**: Winston with daily rotation
- **File Upload**: Multer
- **Validation**: Express Validator

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **State Management**: Redux Toolkit
- **Routing**: React Router v6
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **Authentication**: MSAL React

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Web Server**: Nginx (production)
- **Database**: MySQL, Redis, SQL Server
- **CI/CD**: GitHub Actions (configurable)

---

## Getting Started

### Prerequisites

- **Node.js** (v18+ recommended)
- **npm** (v9+)
- **Docker** & **Docker Compose** (recommended)
- **MySQL** 8.0+ (if running locally)
- **Redis** (if running locally)
- **Microsoft Azure AD App** (for authentication)

### Environment Variables

#### Backend `.env` Configuration

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration (MySQL)
DB_HOST=localhost
DB_PORT=3306
DB_NAME=ems_db
DB_USER=ems_user
DB_PASSWORD=ems_password

# MySQL Root Password (for Docker)
MYSQL_ROOT_PASSWORD=ems_root_password

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
JWT_REFRESH_SECRET=your_super_secret_refresh_key_here
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# Microsoft Graph API (Azure AD)
CLIENT_ID=your_azure_client_id
CLIENT_SECRET=your_azure_client_secret
TENANT_ID=your_azure_tenant_id
REDIRECT_URI=http://localhost:5000/api/v1/auth/redirect

# Email Configuration (SendGrid)
SENDGRID_API_KEY=your_sendgrid_api_key
EMAIL_FROM=noreply@wellnessextract.com
EMAIL_FROM_NAME=Wellness Extract EMS

# Redis Configuration (for BullMQ)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=ems_redis_password

# File Upload Configuration
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:5000

# Logging Configuration
LOG_LEVEL=info
LOG_DIR=logs

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# BioMetrics SQL Server Configuration
BIOMETRICS_SERVER=your_biometric_server_ip
BIOMETRICS_DATABASE=ONtime_Att
BIOMETRICS_PORT=1433
BIOMETRICS_ENCRYPT=false
BIOMETRICS_TRUST_CERT=true
BIOMETRICS_USER=your_sql_user
BIOMETRICS_PASSWORD=your_sql_password
```

#### Frontend `.env` Configuration

```env
VITE_API_URL=http://localhost:5000/api/v1
VITE_CLIENT_ID=your_azure_client_id
VITE_TENANT_ID=your_azure_tenant_id
VITE_REDIRECT_URI=http://localhost:5173/auth/redirect
```

### Installation

#### Option 1: Docker Setup (Recommended)

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/ems.git
   cd ems
   ```

2. **Configure environment variables**
   ```bash
   cp backend/env.example backend/.env
   cp frontend/env.example frontend/.env
   # Edit the .env files with your configuration
   ```

3. **Start with Docker Compose**
   ```bash
   docker-compose up -d
   ```

4. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000/api/v1
   - phpMyAdmin: http://localhost:8080

#### Option 2: Local Development Setup

1. **Clone and install dependencies**
   ```bash
   git clone https://github.com/your-org/ems.git
   cd ems
   
   # Backend dependencies
   cd backend
   npm install
   
   # Frontend dependencies
   cd ../frontend
   npm install
   ```

2. **Set up databases**
   - Start MySQL and Redis locally
   - Create the `ems_db` database
   - Update `.env` files with local connection details

3. **Start the applications**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev
   
   # Terminal 2 - Frontend
   cd frontend
   npm run dev
   ```

---

## Docker Setup

The project includes comprehensive Docker configuration for both development and production environments.

### Development
```bash
docker-compose up -d
```

### Production
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Services Included
- **Backend**: Node.js Express API
- **Frontend**: React SPA with Nginx
- **MySQL**: Primary database
- **Redis**: Caching and queues
- **phpMyAdmin**: Database management interface

---

## Scripts

### Backend Scripts
```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
npm test           # Run tests (if implemented)
```

### Frontend Scripts
```bash
npm run dev        # Start Vite development server
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Lint code with ESLint
```

### Docker Scripts
```bash
make build         # Build all Docker images
make up            # Start all services
make down          # Stop all services
make logs          # View logs
make clean         # Clean up containers and images
```

---

## API Overview

### Authentication Endpoints
- `POST /api/v1/auth/login` - Initiate Azure AD login
- `GET /api/v1/auth/redirect` - Handle Azure AD callback
- `POST /api/v1/auth/logout` - Logout user
- `POST /api/v1/auth/refresh` - Refresh JWT token

### Employee Management
- `GET /api/v1/employees` - List employees (paginated)
- `POST /api/v1/employees` - Create new employee
- `GET /api/v1/employees/:id` - Get employee details
- `PUT /api/v1/employees/:id` - Update employee
- `DELETE /api/v1/employees/:id` - Delete employee

### Asset Management
- `GET /api/v1/hardware` - List hardware assets
- `POST /api/v1/hardware` - Create hardware asset
- `GET /api/v1/software` - List software assets
- `POST /api/v1/software` - Create software asset

### Biometric Integration
- `GET /api/v1/biometrics/test` - Test biometric connection
- `GET /api/v1/biometrics/employees` - Get biometric employees
- `GET /api/v1/biometrics/attendance` - Get attendance data

### Health Check
- `GET /api/v1/health` - API health status
- `GET /health` - Simple health check

---

## Frontend Overview

### Architecture
- **React 18** with functional components and hooks
- **Redux Toolkit** for state management
- **React Router v6** for client-side routing
- **Tailwind CSS** for styling
- **Axios** for API communication

### Key Features
- **Responsive Design**: Mobile-first approach
- **Role-based Access**: Different views for admin, manager, employee
- **Real-time Updates**: Live data synchronization
- **File Upload**: Drag-and-drop file handling
- **Search & Filtering**: Advanced data filtering
- **Pagination**: Efficient data loading

### Component Structure
- **Pages**: Main application views
- **Components**: Reusable UI components
- **Layouts**: Page layout templates
- **Store**: Redux state management
- **Auth**: Authentication context and components

---

## Authentication

The application uses Microsoft Azure AD for authentication with the following flow:

1. **Login Initiation**: User enters employee ID or email
2. **Azure AD Redirect**: Redirected to Microsoft login page
3. **Authentication**: User authenticates with Microsoft credentials
4. **Callback Handling**: Backend processes authentication response
5. **JWT Generation**: Creates JWT tokens for session management
6. **Frontend Redirect**: User redirected to application with tokens

### User Roles
- **Admin**: Full system access
- **Manager**: Employee and asset management
- **Employee**: Personal profile and assigned assets

---

## Biometric Integration

The system integrates with biometric attendance devices through SQL Server:

### Features
- **Real-time Sync**: Live attendance data from biometric devices
- **Employee Mapping**: Links biometric employees to system employees
- **Attendance Reports**: Comprehensive attendance analytics
- **Department Management**: Organize employees by departments

### Configuration
- SQL Server connection for biometric database
- Windows Authentication or SQL Authentication
- Configurable encryption and certificate settings

---

## Logging & Audit

### Backend Logging
- **Winston Logger**: Structured logging with multiple transports
- **Daily Rotation**: Automatic log file rotation
- **Log Levels**: Error, warn, info, debug
- **Audit Trail**: Sensitive action logging

### Log Files
- `combined-*.log`: All application logs
- `error-*.log`: Error logs only
- `exceptions-*.log`: Unhandled exceptions

### Frontend Logging
- Browser console logging for development
- Error boundary for React error handling
- API request/response logging

---

## Contributing

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/your-feature`
3. **Make your changes**: Follow the coding standards
4. **Test your changes**: Ensure all tests pass
5. **Commit your changes**: `git commit -am 'Add new feature'`
6. **Push to the branch**: `git push origin feature/your-feature`
7. **Open a Pull Request**: Provide detailed description

### Development Guidelines
- Follow ESLint configuration
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Follow the existing code style

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Support

For questions, issues, or support:
- **Issues**: Create a GitHub issue
- **Documentation**: Check the inline code documentation
- **Contact**: [Your contact information]

---

## Changelog

### Version 1.0.0
- Initial release with core EMS functionality
- Azure AD authentication integration
- Biometric attendance system
- Asset and license management
- Docker containerization
- Comprehensive logging and audit trails
# Docker Setup for EMS Full Stack

This document explains how to use Docker for the Employee Management System (frontend + backend).

## Prerequisites

- Docker and Docker Compose installed
- Make (optional, for simplified commands)

## Quick Start

### Development Environment

```bash
# Start all services (backend, MySQL, phpMyAdmin)
make dev
# or
docker-compose up -d

# View logs
make logs
# or
docker-compose logs -f

# Stop services
docker-compose down
```

### Production Environment

```bash
# Start production environment
make prod
# or
docker-compose -f docker-compose.prod.yml up -d

# Stop production services
docker-compose -f docker-compose.prod.yml down
```

## Services

### Frontend Service
- **Container**: `ems-frontend`
- **Port**: 5173 (dev) / 80 (prod)
- **Development**: Uses `Dockerfile.dev` with Vite dev server
- **Production**: Uses `Dockerfile` with nginx serving built React app

### Backend Service
- **Container**: `ems-backend`
- **Port**: 5000
- **Health Check**: http://localhost:5000/api/v1/health
- **Development**: Uses `Dockerfile.dev` with nodemon for hot reloading
- **Production**: Uses `Dockerfile` with optimized build

### MySQL Database
- **Container**: `ems-mysql`
- **Port**: 3306
- **Database**: `ems_db`
- **User**: `ems_user`
- **Password**: `ems_password` (configurable via environment)

### Redis Cache
- **Container**: `ems-redis`
- **Port**: 6379
- **Password**: `ems_redis_password` (configurable via environment)
- **Features**: API response caching, session storage, performance optimization

### phpMyAdmin
- **Container**: `ems-phpmyadmin`
- **Port**: 8080
- **URL**: http://localhost:8080

## Environment Variables

Create a `.env` file in the project root:

```env
# Database Configuration
MYSQL_ROOT_PASSWORD=your_root_password
MYSQL_DATABASE=ems_db
MYSQL_USER=ems_user
MYSQL_PASSWORD=your_password

# Backend Configuration
NODE_ENV=development
PORT=5000
DB_HOST=mysql
DB_PORT=3306
DB_NAME=ems_db
DB_USER=ems_user
DB_PASSWORD=your_password

# Redis Configuration
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password
```

## Available Commands

| Command | Description |
|---------|-------------|
| `make dev` | Start development environment |
| `make prod` | Start production environment |
| `make build` | Build all Docker images |
| `make build-backend` | Build backend Docker image only |
| `make build-frontend` | Build frontend Docker image only |
| `make clean` | Stop and remove all containers/volumes |
| `make logs` | Show logs from all services |
| `make shell` | Open shell in backend container |
| `make shell-frontend` | Open shell in frontend container |
| `make restart` | Restart all services |
| `make dev-rebuild` | Rebuild and start development |
| `make prod-rebuild` | Rebuild and start production |

## Development Workflow

1. **Start Development Environment**:
   ```bash
   make dev
   ```

2. **Make Code Changes**: 
   - Files are mounted as volumes, so changes are reflected immediately
   - Backend will auto-restart with nodemon

3. **View Logs**:
   ```bash
   make logs
   ```

4. **Access Services**:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000
   - phpMyAdmin: http://localhost:8080
   - Redis: localhost:6379
   - Health Check: http://localhost:5000/api/v1/health

5. **Stop Services**:
   ```bash
   docker-compose down
   ```

## Production Deployment

1. **Build and Start**:
   ```bash
   make prod
   ```

2. **Access Production Services**:
   - Frontend: http://localhost:80
   - Backend API: http://localhost:5000
   - phpMyAdmin: http://localhost:8080
   - Redis: localhost:6379

## Troubleshooting

### Backend Won't Start
```bash
# Check logs
docker-compose logs backend

# Rebuild container
docker-compose up -d --build backend
```

### Database Connection Issues
```bash
# Check MySQL logs
docker-compose logs mysql

# Restart MySQL
docker-compose restart mysql
```

### Clean Slate
```bash
# Stop everything and remove volumes
make clean

# Start fresh
make dev
```

## File Structure

```
backend/
├── Dockerfile          # Production Docker image
├── Dockerfile.dev      # Development Docker image
├── .dockerignore       # Files to ignore in Docker build
└── ...

frontend/
├── Dockerfile          # Production Docker image (nginx)
├── Dockerfile.dev      # Development Docker image (Vite)
├── nginx.conf          # Nginx configuration for production
├── .dockerignore       # Files to ignore in Docker build
└── ...

docker-compose.yml      # Development environment
docker-compose.prod.yml # Production environment
Makefile               # Simplified commands
DOCKER.md              # This documentation
```

## Volumes

- `mysql_data`: Persistent MySQL data
- `backend_uploads`: Backend file uploads
- `backend_logs`: Backend application logs
- `redis_data`: Redis persistent data

## Redis Features

### Caching
- **API Response Caching**: Frequently accessed data is cached for 5 minutes
- **Performance Improvement**: Reduces database queries and response times
- **Automatic Invalidation**: Cache is cleared when data is modified

### Session Storage
- **User Sessions**: Store user session data in Redis
- **Scalability**: Multiple backend instances can share session data
- **Persistence**: Sessions survive container restarts

### Cache Keys
- `hardware:list:{role}:{userId}` - Hardware list cache
- `session:{sessionId}` - User session data
- `api:{endpoint}` - General API response cache

## Networks

All services run on the `ems-network` bridge network for internal communication.

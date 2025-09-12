#!/bin/bash

# EMS Docker Setup Script

echo "🚀 Setting up EMS Backend with Docker..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cat > .env << EOF
# Database Configuration
MYSQL_ROOT_PASSWORD=ems_root_password
MYSQL_DATABASE=ems_db
MYSQL_USER=ems_user
MYSQL_PASSWORD=ems_password

# Backend Configuration
NODE_ENV=development
PORT=5000
DB_HOST=mysql
DB_PORT=3306
DB_NAME=ems_db
DB_USER=ems_user
DB_PASSWORD=ems_password
EOF
    echo "✅ .env file created with default values"
else
    echo "✅ .env file already exists"
fi

# Stop any existing containers
echo "🛑 Stopping existing containers..."
docker-compose down 2>/dev/null || true

# Build and start services
echo "🔨 Building and starting services..."
docker-compose up -d --build

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 10

# Check if services are running
echo "🔍 Checking service status..."
if docker-compose ps | grep -q "Up"; then
    echo "✅ Services are running!"
    echo ""
    echo "🌐 Access your services:"
    echo "   Backend API: http://localhost:5000"
    echo "   Health Check: http://localhost:5000/api/v1/health"
    echo "   phpMyAdmin: http://localhost:8080"
    echo ""
    echo "📋 Useful commands:"
    echo "   View logs: docker-compose logs -f"
    echo "   Stop services: docker-compose down"
    echo "   Restart: docker-compose restart"
else
    echo "❌ Some services failed to start. Check logs with: docker-compose logs"
    exit 1
fi

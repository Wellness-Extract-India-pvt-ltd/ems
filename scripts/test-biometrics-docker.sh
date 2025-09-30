#!/bin/bash

# BioMetrics Docker Integration Test Script
# This script tests the BioMetrics integration in Docker environment

set -e

echo "🧪 Testing BioMetrics Docker Integration..."
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    if [ $2 -eq 0 ]; then
        echo -e "${GREEN}✅ $1${NC}"
    else
        echo -e "${RED}❌ $1${NC}"
    fi
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Check if Docker is running
echo "1. Checking Docker status..."
if docker info > /dev/null 2>&1; then
    print_status "Docker is running" 0
else
    print_status "Docker is not running" 1
    exit 1
fi

# Check if docker-compose is available
echo "2. Checking docker-compose..."
if command -v docker-compose > /dev/null 2>&1; then
    print_status "docker-compose is available" 0
else
    print_status "docker-compose is not available" 1
    exit 1
fi

# Check if .env file exists
echo "3. Checking environment configuration..."
if [ -f ".env" ]; then
    print_status ".env file exists" 0
    
    # Check for BioMetrics variables
    if grep -q "BIOMETRICS_SERVER" .env; then
        print_status "BioMetrics configuration found in .env" 0
    else
        print_warning "BioMetrics configuration not found in .env"
    fi
else
    print_warning ".env file not found - using default values"
fi

# Build and start services
echo "4. Building and starting Docker services..."
if docker-compose up -d --build; then
    print_status "Docker services started successfully" 0
else
    print_status "Failed to start Docker services" 1
    exit 1
fi

# Wait for services to be ready
echo "5. Waiting for services to be ready..."
sleep 10

# Check if containers are running
echo "6. Checking container status..."
containers=("ems-backend" "ems-frontend" "ems-mysql" "ems-redis" "ems-phpmyadmin")
all_running=true

for container in "${containers[@]}"; do
    if docker ps --format "table {{.Names}}" | grep -q "$container"; then
        print_status "$container is running" 0
    else
        print_status "$container is not running" 1
        all_running=false
    fi
done

if [ "$all_running" = false ]; then
    print_warning "Some containers are not running. Check logs with: docker-compose logs"
fi

# Test backend health endpoint
echo "7. Testing backend health endpoint..."
if curl -s -f http://localhost:5000/api/v1/health > /dev/null; then
    print_status "Backend health endpoint is responding" 0
else
    print_status "Backend health endpoint is not responding" 1
fi

# Test BioMetrics connection (requires authentication)
echo "8. Testing BioMetrics database connectivity..."
if docker-compose exec -T backend node -e "
const { testBiometricsConnection } = require('./database/biometricsConnection.js');
testBiometricsConnection().then(result => {
    console.log('BioMetrics connection test:', result ? 'SUCCESS' : 'FAILED');
    process.exit(result ? 0 : 1);
}).catch(err => {
    console.log('BioMetrics connection test: FAILED -', err.message);
    process.exit(1);
});
" 2>/dev/null; then
    print_status "BioMetrics database connection successful" 0
else
    print_warning "BioMetrics database connection failed - check network connectivity to 172.16.1.171"
fi

# Test frontend accessibility
echo "9. Testing frontend accessibility..."
if curl -s -f http://localhost:5173 > /dev/null; then
    print_status "Frontend is accessible" 0
else
    print_status "Frontend is not accessible" 1
fi

# Test MySQL connectivity
echo "10. Testing MySQL connectivity..."
if docker-compose exec -T mysql mysql -u root -p${MYSQL_ROOT_PASSWORD:-ems_root_password} -e "SELECT 1;" > /dev/null 2>&1; then
    print_status "MySQL is accessible" 0
else
    print_status "MySQL is not accessible" 1
fi

# Test Redis connectivity
echo "11. Testing Redis connectivity..."
if docker-compose exec -T redis redis-cli ping > /dev/null 2>&1; then
    print_status "Redis is accessible" 0
else
    print_status "Redis is not accessible" 1
fi

# Display service URLs
echo ""
echo "🌐 Service URLs:"
echo "================"
echo "Frontend:     http://localhost:5173"
echo "Backend API:  http://localhost:5000/api/v1"
echo "phpMyAdmin:   http://localhost:8080"
echo "MySQL:        localhost:3306"
echo "Redis:        localhost:6379"
echo ""

# Display BioMetrics endpoints
echo "🔗 BioMetrics API Endpoints:"
echo "============================"
echo "Test Connection:     GET /api/v1/biometrics/test-connection"
echo "Database Info:       GET /api/v1/biometrics/database-info"
echo "Employees:           GET /api/v1/biometrics/employees"
echo "Departments:         GET /api/v1/biometrics/departments"
echo "Recent Attendance:   GET /api/v1/biometrics/attendance/recent"
echo "Attendance Summary:  GET /api/v1/biometrics/attendance/summary"
echo ""

# Display useful commands
echo "🛠️  Useful Commands:"
echo "==================="
echo "View logs:           docker-compose logs -f"
echo "Stop services:       docker-compose down"
echo "Restart services:    docker-compose restart"
echo "Access backend:      docker-compose exec backend sh"
echo "Access MySQL:        docker-compose exec mysql mysql -u root -p"
echo ""

echo "🎉 BioMetrics Docker integration test completed!"
echo "Check the results above and address any issues before proceeding."

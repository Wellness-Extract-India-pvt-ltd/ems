# EMS Docker Setup Script for Windows PowerShell

Write-Host "🚀 Setting up EMS Backend with Docker..." -ForegroundColor Green

# Check if Docker is running
try {
    docker info | Out-Null
    Write-Host "✅ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not running. Please start Docker Desktop and try again." -ForegroundColor Red
    exit 1
}

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host "📝 Creating .env file from template..." -ForegroundColor Yellow
    @"
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
"@ | Out-File -FilePath ".env" -Encoding UTF8
    Write-Host "✅ .env file created with default values" -ForegroundColor Green
} else {
    Write-Host "✅ .env file already exists" -ForegroundColor Green
}

# Stop any existing containers
Write-Host "🛑 Stopping existing containers..." -ForegroundColor Yellow
docker-compose down 2>$null

# Build and start services
Write-Host "🔨 Building and starting services..." -ForegroundColor Yellow
docker-compose up -d --build

# Wait for services to be ready
Write-Host "⏳ Waiting for services to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Check if services are running
Write-Host "🔍 Checking service status..." -ForegroundColor Yellow
$services = docker-compose ps
if ($services -match "Up") {
    Write-Host "✅ Services are running!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🌐 Access your services:" -ForegroundColor Cyan
    Write-Host "   Frontend: http://localhost:5173" -ForegroundColor White
    Write-Host "   Backend API: http://localhost:5000" -ForegroundColor White
    Write-Host "   Health Check: http://localhost:5000/api/v1/health" -ForegroundColor White
    Write-Host "   phpMyAdmin: http://localhost:8080" -ForegroundColor White
    Write-Host ""
    Write-Host "📋 Useful commands:" -ForegroundColor Cyan
    Write-Host "   View logs: docker-compose logs -f" -ForegroundColor White
    Write-Host "   Stop services: docker-compose down" -ForegroundColor White
    Write-Host "   Restart: docker-compose restart" -ForegroundColor White
} else {
    Write-Host "❌ Some services failed to start. Check logs with: docker-compose logs" -ForegroundColor Red
    exit 1
}

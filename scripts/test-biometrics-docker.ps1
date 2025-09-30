# BioMetrics Docker Integration Test Script (PowerShell)
# This script tests the BioMetrics integration in Docker environment

param(
    [switch]$SkipBuild = $false
)

Write-Host "🧪 Testing BioMetrics Docker Integration..." -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan

# Function to print colored output
function Write-Status {
    param(
        [string]$Message,
        [bool]$Success
    )
    
    if ($Success) {
        Write-Host "✅ $Message" -ForegroundColor Green
    } else {
        Write-Host "❌ $Message" -ForegroundColor Red
    }
}

function Write-Warning {
    param([string]$Message)
    Write-Host "⚠️  $Message" -ForegroundColor Yellow
}

# Check if Docker is running
Write-Host "1. Checking Docker status..." -ForegroundColor White
try {
    $dockerInfo = docker info 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Status "Docker is running" $true
    } else {
        Write-Status "Docker is not running" $false
        exit 1
    }
} catch {
    Write-Status "Docker is not available" $false
    exit 1
}

# Check if docker-compose is available
Write-Host "2. Checking docker-compose..." -ForegroundColor White
try {
    $composeVersion = docker-compose --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Status "docker-compose is available" $true
    } else {
        Write-Status "docker-compose is not available" $false
        exit 1
    }
} catch {
    Write-Status "docker-compose is not available" $false
    exit 1
}

# Check if .env file exists
Write-Host "3. Checking environment configuration..." -ForegroundColor White
if (Test-Path ".env") {
    Write-Status ".env file exists" $true
    
    # Check for BioMetrics variables
    $envContent = Get-Content ".env" -Raw
    if ($envContent -match "BIOMETRICS_SERVER") {
        Write-Status "BioMetrics configuration found in .env" $true
    } else {
        Write-Warning "BioMetrics configuration not found in .env"
    }
} else {
    Write-Warning ".env file not found - using default values"
}

# Build and start services
Write-Host "4. Building and starting Docker services..." -ForegroundColor White
if (-not $SkipBuild) {
    try {
        docker-compose up -d --build
        if ($LASTEXITCODE -eq 0) {
            Write-Status "Docker services started successfully" $true
        } else {
            Write-Status "Failed to start Docker services" $false
            exit 1
        }
    } catch {
        Write-Status "Failed to start Docker services" $false
        exit 1
    }
} else {
    try {
        docker-compose up -d
        if ($LASTEXITCODE -eq 0) {
            Write-Status "Docker services started successfully (skipped build)" $true
        } else {
            Write-Status "Failed to start Docker services" $false
            exit 1
        }
    } catch {
        Write-Status "Failed to start Docker services" $false
        exit 1
    }
}

# Wait for services to be ready
Write-Host "5. Waiting for services to be ready..." -ForegroundColor White
Start-Sleep -Seconds 15

# Check if containers are running
Write-Host "6. Checking container status..." -ForegroundColor White
$containers = @("ems-backend", "ems-frontend", "ems-mysql", "ems-redis", "ems-phpmyadmin")
$allRunning = $true

foreach ($container in $containers) {
    try {
        $containerStatus = docker ps --format "table {{.Names}}" | Select-String $container
        if ($containerStatus) {
            Write-Status "$container is running" $true
        } else {
            Write-Status "$container is not running" $false
            $allRunning = $false
        }
    } catch {
        Write-Status "$container is not running" $false
        $allRunning = $false
    }
}

if (-not $allRunning) {
    Write-Warning "Some containers are not running. Check logs with: docker-compose logs"
}

# Test backend health endpoint
Write-Host "7. Testing backend health endpoint..." -ForegroundColor White
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/v1/health" -Method GET -TimeoutSec 10 -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Status "Backend health endpoint is responding" $true
    } else {
        Write-Status "Backend health endpoint is not responding" $false
    }
} catch {
    Write-Status "Backend health endpoint is not responding" $false
}

# Test BioMetrics connection
Write-Host "8. Testing BioMetrics database connectivity..." -ForegroundColor White
try {
    $testScript = @"
const { testBiometricsConnection } = require('./database/biometricsConnection.js');
testBiometricsConnection().then(result => {
    console.log('BioMetrics connection test:', result ? 'SUCCESS' : 'FAILED');
    process.exit(result ? 0 : 1);
}).catch(err => {
    console.log('BioMetrics connection test: FAILED -', err.message);
    process.exit(1);
});
"@
    
    $testScript | docker-compose exec -T backend node 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Status "BioMetrics database connection successful" $true
    } else {
        Write-Warning "BioMetrics database connection failed - check network connectivity to 172.16.1.171"
    }
} catch {
    Write-Warning "BioMetrics database connection test failed"
}

# Test frontend accessibility
Write-Host "9. Testing frontend accessibility..." -ForegroundColor White
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5173" -Method GET -TimeoutSec 10 -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Status "Frontend is accessible" $true
    } else {
        Write-Status "Frontend is not accessible" $false
    }
} catch {
    Write-Status "Frontend is not accessible" $false
}

# Test MySQL connectivity
Write-Host "10. Testing MySQL connectivity..." -ForegroundColor White
try {
    $mysqlPassword = $env:MYSQL_ROOT_PASSWORD
    if (-not $mysqlPassword) {
        $mysqlPassword = "ems_root_password"
    }
    
    $mysqlTest = "SELECT 1;" | docker-compose exec -T mysql mysql -u root -p$mysqlPassword 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Status "MySQL is accessible" $true
    } else {
        Write-Status "MySQL is not accessible" $false
    }
} catch {
    Write-Status "MySQL is not accessible" $false
}

# Test Redis connectivity
Write-Host "11. Testing Redis connectivity..." -ForegroundColor White
try {
    $redisTest = "PING" | docker-compose exec -T redis redis-cli 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Status "Redis is accessible" $true
    } else {
        Write-Status "Redis is not accessible" $false
    }
} catch {
    Write-Status "Redis is not accessible" $false
}

# Display service URLs
Write-Host ""
Write-Host "🌐 Service URLs:" -ForegroundColor Cyan
Write-Host "================" -ForegroundColor Cyan
Write-Host "Frontend:     http://localhost:5173" -ForegroundColor White
Write-Host "Backend API:  http://localhost:5000/api/v1" -ForegroundColor White
Write-Host "phpMyAdmin:   http://localhost:8080" -ForegroundColor White
Write-Host "MySQL:        localhost:3306" -ForegroundColor White
Write-Host "Redis:        localhost:6379" -ForegroundColor White
Write-Host ""

# Display BioMetrics endpoints
Write-Host "🔗 BioMetrics API Endpoints:" -ForegroundColor Cyan
Write-Host "============================" -ForegroundColor Cyan
Write-Host "Test Connection:     GET /api/v1/biometrics/test-connection" -ForegroundColor White
Write-Host "Database Info:       GET /api/v1/biometrics/database-info" -ForegroundColor White
Write-Host "Employees:           GET /api/v1/biometrics/employees" -ForegroundColor White
Write-Host "Departments:         GET /api/v1/biometrics/departments" -ForegroundColor White
Write-Host "Recent Attendance:   GET /api/v1/biometrics/attendance/recent" -ForegroundColor White
Write-Host "Attendance Summary:  GET /api/v1/biometrics/attendance/summary" -ForegroundColor White
Write-Host ""

# Display useful commands
Write-Host "🛠️  Useful Commands:" -ForegroundColor Cyan
Write-Host "===================" -ForegroundColor Cyan
Write-Host "View logs:           docker-compose logs -f" -ForegroundColor White
Write-Host "Stop services:       docker-compose down" -ForegroundColor White
Write-Host "Restart services:    docker-compose restart" -ForegroundColor White
Write-Host "Access backend:      docker-compose exec backend sh" -ForegroundColor White
Write-Host "Access MySQL:        docker-compose exec mysql mysql -u root -p" -ForegroundColor White
Write-Host ""

Write-Host "🎉 BioMetrics Docker integration test completed!" -ForegroundColor Green
Write-Host "Check the results above and address any issues before proceeding." -ForegroundColor Yellow

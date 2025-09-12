# PowerShell script to start EMS MySQL Docker Container

Write-Host "Starting EMS MySQL Docker Container..." -ForegroundColor Green
Write-Host ""

# Check if Docker is running
try {
    docker info | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "Docker is not running"
    }
} catch {
    Write-Host "Error: Docker is not running. Please start Docker Desktop first." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Start the MySQL container
Write-Host "Starting MySQL container..." -ForegroundColor Yellow
docker-compose up -d mysql

# Wait for MySQL to be ready
Write-Host "Waiting for MySQL to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Check if container is running
Write-Host "Container status:" -ForegroundColor Cyan
docker-compose ps mysql

Write-Host ""
Write-Host "MySQL container started successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Database Information:" -ForegroundColor Cyan
Write-Host "- Host: localhost"
Write-Host "- Port: 3306"
Write-Host "- Database: ems_db"
Write-Host "- Username: ems_user"
Write-Host "- Password: ems_password"
Write-Host ""
Write-Host "You can access phpMyAdmin at: http://localhost:8080" -ForegroundColor Blue
Write-Host ""
Write-Host "To stop the container, run: docker-compose down" -ForegroundColor Yellow
Write-Host ""
Read-Host "Press Enter to continue"

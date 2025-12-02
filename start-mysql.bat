@echo off
echo Starting EMS MySQL Docker Container...
echo.

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Docker is not running. Please start Docker Desktop first.
    pause
    exit /b 1
)

REM Start the MySQL container
echo Starting MySQL container...
docker-compose up -d mysql

REM Wait for MySQL to be ready
echo Waiting for MySQL to be ready...
timeout /t 10 /nobreak >nul

REM Check if container is running
docker-compose ps mysql

echo.
echo MySQL container started successfully!
echo.
echo Database Information:
echo - Host: localhost
echo - Port: 3306
echo - Database: ems_db
echo - Username: ems_user
echo - Password: ems_password
echo.
echo You can access phpMyAdmin at: http://localhost:8080
echo.
echo To stop the container, run: docker-compose down
echo.
pause

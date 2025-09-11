# Wellness Extract EMS - Development Server Starter
# This script starts both backend and frontend servers

Write-Host "🚀 Starting Wellness Extract EMS Development Servers..." -ForegroundColor Green
Write-Host ""

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed or not in PATH" -ForegroundColor Red
    exit 1
}

# Check if MongoDB is running (optional check)
try {
    $mongoCheck = Get-Process -Name "mongod" -ErrorAction SilentlyContinue
    if ($mongoCheck) {
        Write-Host "✅ MongoDB is running" -ForegroundColor Green
    } else {
        Write-Host "⚠️  MongoDB might not be running. Make sure MongoDB is started." -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  Could not check MongoDB status" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📦 Starting Backend Server..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; npm run dev" -WindowStyle Normal

Write-Host "📦 Starting Frontend Server..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev" -WindowStyle Normal

Write-Host ""
Write-Host "⏳ Waiting for servers to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Check server status
Write-Host ""
Write-Host "🔍 Checking server status..." -ForegroundColor Cyan

try {
    $backend = Invoke-WebRequest -Uri "http://localhost:5000/api/v1/health" -UseBasicParsing -TimeoutSec 5
    Write-Host "✅ Backend Server: Running on http://localhost:5000" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend Server: Not responding" -ForegroundColor Red
}

try {
    $frontend = Invoke-WebRequest -Uri "http://localhost:5173" -UseBasicParsing -TimeoutSec 5
    Write-Host "✅ Frontend Server: Running on http://localhost:5173" -ForegroundColor Green
} catch {
    Write-Host "❌ Frontend Server: Not responding" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎉 Development servers are ready!" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Access your application:" -ForegroundColor White
Write-Host "   Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host "   Backend API: http://localhost:5000/api/v1" -ForegroundColor Cyan
Write-Host "   Health Check: http://localhost:5000/api/v1/health" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 Tips:" -ForegroundColor White
Write-Host "   - Press Ctrl+C in each terminal to stop the servers" -ForegroundColor Gray
Write-Host "   - Backend will auto-restart on file changes (nodemon)" -ForegroundColor Gray
Write-Host "   - Frontend will auto-reload on file changes (Vite)" -ForegroundColor Gray
Write-Host ""
Write-Host "Press any key to exit this script..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

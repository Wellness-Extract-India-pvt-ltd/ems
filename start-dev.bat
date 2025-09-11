@echo off
echo 🚀 Starting Wellness Extract EMS Development Servers...
echo.

echo 📦 Starting Backend Server...
start "Backend Server" cmd /k "cd backend && npm run dev"

echo 📦 Starting Frontend Server...
start "Frontend Server" cmd /k "cd frontend && npm run dev"

echo.
echo ⏳ Waiting for servers to start...
timeout /t 10 /nobreak > nul

echo.
echo 🎉 Development servers are starting!
echo.
echo 🌐 Access your application:
echo    Frontend: http://localhost:5173
echo    Backend API: http://localhost:5000/api/v1
echo    Health Check: http://localhost:5000/api/v1/health
echo.
echo 💡 Tips:
echo    - Close the terminal windows to stop the servers
echo    - Backend will auto-restart on file changes (nodemon)
echo    - Frontend will auto-reload on file changes (Vite)
echo.
pause

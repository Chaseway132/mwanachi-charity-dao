@echo off
REM Start backend server in a new window
start "Backend Server" cmd /k "cd backend && node server.js"

REM Wait a moment for backend to start
timeout /t 3 /nobreak

REM Start frontend server in a new window
start "Frontend Server" cmd /k "cd charity-dao-frontend && npm start"

echo.
echo Backend server started on http://localhost:5000
echo Frontend server starting on http://localhost:3000
echo.
pause


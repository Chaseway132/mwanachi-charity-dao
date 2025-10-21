# Start backend server in a new PowerShell window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'backend'; node server.js"

# Wait a moment for backend to start
Start-Sleep -Seconds 3

# Start frontend server in a new PowerShell window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'charity-dao-frontend'; npm start"

Write-Host ""
Write-Host "Backend server started on http://localhost:5000"
Write-Host "Frontend server starting on http://localhost:3000"
Write-Host ""
Write-Host "Press Ctrl+C in each window to stop the servers"


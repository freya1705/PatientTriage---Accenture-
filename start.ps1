# PatientTriage.ai One-Command Full-Stack Launcher

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  PatientTriage.ai - Full Stack Emergency Command Center" -ForegroundColor Green
Write-Host "  Decide First. Watch Continuously. Act in Time." -ForegroundColor Yellow
Write-Host "============================================================" -ForegroundColor Cyan

# Start Backend
Write-Host "Launching FastAPI Intelligence Backend on port 8000..." -ForegroundColor Cyan

$backendProcess = Start-Process `
    -FilePath "python" `
    -ArgumentList "-m uvicorn backend.main:app --reload --port 8000" `
    -PassThru `
    -NoNewWindow

Start-Sleep -Seconds 2

# Start Frontend
Write-Host "Launching React Frontend on http://localhost:5173..." -ForegroundColor Green

Set-Location -Path "$PSScriptRoot\frontend"

npm run dev
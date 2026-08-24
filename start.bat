@echo off
title PatientTriage.ai Full-Stack Launcher
echo ============================================================
echo  PatientTriage.ai - Emergency Command Center
echo  Decide First. Watch Continuously. Act in Time.
echo ============================================================

echo [1/2] Starting FastAPI Backend on http://localhost:8000 ...
start "PatientTriage Backend" cmd /k "python -m uvicorn backend.main:app --reload --port 8000"

timeout /t 2 >nul

echo [2/2] Starting React Frontend on http://localhost:5173 ...
cd frontend
npm run dev

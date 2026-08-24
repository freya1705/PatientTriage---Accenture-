@echo off
title Push PatientTriage.ai to GitHub
echo ============================================================
echo  PatientTriage.ai - Automated GitHub Pusher
echo ============================================================
echo.
set /p REPO_URL="Enter your GitHub Repository URL (e.g., https://github.com/your-username/PatientTriageAI.git): "

if "%REPO_URL%"=="" (
    echo Error: No repository URL provided.
    pause
    exit /b
)

echo.
echo [1/3] Checking Git status...
git add .
git commit -m "feat: complete PatientTriage.ai working prototype for Accenture Innovation Challenge 2026"

echo.
echo [2/3] Setting remote origin...
git remote remove origin >nul 2>&1
git remote add origin %REPO_URL%
git branch -M main

echo.
echo [3/3] Pushing to main branch on GitHub...
git push -u origin main

echo.
echo ============================================================
echo  Done! PatientTriage.ai has been pushed to GitHub successfully.
echo ============================================================
pause

@echo off
title Doggie Care System

echo ==================================================
echo   Doggie Care System - GUI Controller
echo ==================================================
echo.

where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js not found. Please install Node.js first.
    pause
    exit /b 1
)

for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3001 ^| findstr LISTENING 2^>nul') do (
    echo [INFO] Clearing stale controller on port 3001 (PID: %%a)...
    taskkill /f /pid %%a >nul 2>&1
)

echo [INFO] Opening browser...
start http://localhost:3001

echo [INFO] Starting GUI controller server...
node tools/gui-controller/controller.js



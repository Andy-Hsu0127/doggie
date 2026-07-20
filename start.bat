@echo off
title Doggie Care System - Starter

echo ==================================================
echo         Doggie Care System - Local Server
echo ==================================================
echo.

:: 1. Check and install dependencies
if not exist "node_modules\" (
    echo [1/3] Installing dependencies, please wait...
    call npm install
) else (
    echo [1/3] Dependencies already installed. Skipping.
)

:: 2. Check and migrate database
if not exist "doggie.db" (
    echo [2/3] Initializing SQLite database and seeds...
    call npx prisma migrate dev --name init
    call npx prisma db seed
) else (
    echo [2/3] Database file doggie.db found. Skipping.
)

:: 3. Start Next.js development server
echo [3/3] Starting Next.js server in the background...
start /min cmd /c "npm run dev"

echo.
echo ==================================================
echo  Server is starting in a minimized window!
echo  Opening pages in 5 seconds...
echo ==================================================
timeout /t 5 >nul

:: 4. Auto-open browser
start http://localhost:3000
start http://localhost:3000/login

exit

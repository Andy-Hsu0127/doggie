@echo off
title Doggie Care System - Starter

echo ==================================================
echo         Doggie Care System - Local Server
echo ==================================================
echo.

:: 1. Check and install dependencies
if not exist "node_modules\" (
    echo [1/4] Installing dependencies, please wait...
    call npm install
) else (
    echo [1/4] Dependencies already installed. Skipping.
)

:: 2. Check and migrate database
if not exist "doggie.db" (
    echo [2/4] Initializing SQLite database and seeds...
    call npx prisma migrate dev --name init
    call npx prisma db seed
) else (
    echo [2/4] Database file doggie.db found. Skipping.
)

:: 3. Check and terminate existing process on port 3000
echo [3/4] Checking for processes occupying port 3000...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000 ^| findstr LISTENING') do (
    echo Found stale process %%a using port 3000. Terminating it to avoid conflicts...
    taskkill /f /pid %%a
)

:: 4. Start Next.js development server
echo [4/4] Starting Next.js server in a new window...
start "Doggie Care System Dev Server" cmd /k "npm run dev"

echo.
echo ==================================================
echo  Server is starting! 
echo  Waiting for the server to be ready on port 3000...
echo ==================================================
echo.

:: Wait loop (up to 15 seconds) for port 3000 to listen
set count=0
:loop
netstat -aon | findstr :3000 | findstr LISTENING >nul
if %errorlevel% equ 0 goto ready
set /a count=%count%+1
if %count% gtr 15 goto timeout
ping 127.0.0.1 -n 2 >nul
goto loop

:timeout
echo.
echo [WARN] Server startup is taking longer than expected.
echo Please check the "Doggie Care System Dev Server" window for status.
echo Opening browser pages anyway...
echo ==================================================
goto open

:ready
echo.
echo ==================================================
echo  Server is ready! Opening pages...
echo ==================================================
goto open

:open
ping 127.0.0.1 -n 2 >nul
start http://localhost:3000
start http://localhost:3000/login

exit

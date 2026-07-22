@echo off
title Doggie Care System - 控制台

echo ==================================================
echo         Doggie Care System - GUI 控制台
echo ==================================================
echo.

:: Check node
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] 找不到 Node.js，請先安裝 Node.js 後再試。
    pause
    exit /b 1
)

:: Kill any stale controller on port 3001
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3001 ^| findstr LISTENING 2^>nul') do (
    echo [控制台] 清除舊的控制台程序 (PID: %%a)...
    taskkill /f /pid %%a >nul 2>&1
)

echo [控制台] 正在啟動 GUI 控制台伺服器...
start "Doggie Controller" cmd /k "node tools/gui-controller/controller.js"

echo [控制台] 等待控制台就緒...

:wait
ping 127.0.0.1 -n 2 >nul
netstat -aon | findstr :3001 | findstr LISTENING >nul
if %errorlevel% neq 0 goto wait

echo [控制台] 控制台已就緒！正在開啟瀏覽器...
start http://localhost:3001
exit

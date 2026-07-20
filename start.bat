@echo off
chcp 65001 >nul
title 🐾 毛孩照護系統 - 快捷啟動器 🐾

echo ==================================================
echo         🐾 毛孩照護系統 — 本地啟動服務 🐾
echo ==================================================
echo.

:: 1. 檢查並安裝套件
if not exist "node_modules\" (
    echo [1/3] 正在安裝必要套件，請稍候...
    call npm install
) else (
    echo [1/3] 套件已安裝，跳過安裝步驟。
)

:: 2. 檢查並初始化資料庫
if not exist "doggie.db" (
    echo [2/3] 正在初始化 SQLite 資料庫與種子資料...
    call npx prisma migrate dev --name init
    call npx prisma db seed
) else (
    echo [2/3] 資料庫檔案 doggie.db 已存在，跳過初始化。
)

:: 3. 啟動 Next.js 本地伺服器
echo [3/3] 正在背景啟動 Next.js 開發伺服器...
start /min cmd /c "npm run dev"

echo.
echo ==================================================
echo  ✅ 服務啟動中！
echo  - 伺服器正在最小化視窗（背景）運行。
echo  - 5 秒後將自動開啟網頁。
echo  - 如需停止服務，請關閉最小化的伺服器視窗即可。
echo ==================================================
timeout /t 5 >nul

:: 4. 自動開啟問卷與後台
start http://localhost:3000
start http://localhost:3000/login

exit

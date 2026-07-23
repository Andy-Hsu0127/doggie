@echo off
if "%1"=="hidden" goto run
powershell -WindowStyle Hidden -Command "Start-Process cmd -ArgumentList '/c \"%~f0\" hidden' -WindowStyle Hidden"
exit /b

:run
node tools/gui-controller/controller.js





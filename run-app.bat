@echo off
cd /d "%~dp0"
echo Installing dependencies...
call npm install
echo Starting Expo...
call npx expo start
pause

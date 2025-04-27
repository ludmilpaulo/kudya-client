@echo off
echo Starting Android Emulator...
start "" "C:\Users\ludmil\AppData\Local\Android\Sdk\emulator\emulator.exe" -avd Pixel_6_API_34
timeout /t 10 /nobreak >nul
echo Emulator started.

echo Starting Expo server...
start cmd /k "cd /d H:\GitHub\kudya-client && npm start"

echo Opening browser...
start "" "http://localhost:19002"

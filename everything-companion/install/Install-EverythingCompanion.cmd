@echo off
setlocal
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0Install-EverythingCompanion.ps1"
set "exitCode=%ERRORLEVEL%"
if not "%exitCode%"=="0" goto failed

powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0Verify-EverythingConnection.ps1"
set "exitCode=%ERRORLEVEL%"
if not "%exitCode%"=="0" goto failed

echo.
echo Installation completed and the Companion is connected to Everything.
pause
exit /b 0

:failed
echo.
echo Installation verification failed with exit code %exitCode%.
pause
exit /b %exitCode%

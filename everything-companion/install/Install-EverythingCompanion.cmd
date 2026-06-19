@echo off
setlocal
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0Install-EverythingCompanion.ps1"
set "exitCode=%ERRORLEVEL%"
echo.
if not "%exitCode%"=="0" echo Installation failed with exit code %exitCode%.
pause
exit /b %exitCode%

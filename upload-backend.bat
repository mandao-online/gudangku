@echo off
echo === Gudangku Backend FTP Upload ===
echo.
echo This will upload only the backend folder to Hostinger
echo Server: ftp.dashdearchitect.com
echo Username: u774809254.gudangku
echo Remote Path: /home/u774809254/domains/dashdearchitect.com/public_html/gudangku
echo.
pause

powershell -ExecutionPolicy Bypass -File "upload-backend.ps1"

pause
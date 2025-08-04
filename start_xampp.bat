@echo off
echo ========================================
echo    XAMPP MySQL Service Manager
echo ========================================
echo.

echo Checking XAMPP installation...
if not exist "C:\xampp\mysql\bin\mysql.exe" (
    echo ERROR: XAMPP MySQL not found!
    echo Please install XAMPP first.
    pause
    exit /b 1
)

echo XAMPP MySQL found!
echo.

echo Starting XAMPP Control Panel...
start "" "C:\xampp\xampp-control.exe"

echo.
echo Instructions:
echo 1. In XAMPP Control Panel, click START next to Apache
echo 2. Click START next to MySQL
echo 3. Wait for both services to show green status
echo.
echo Once services are running, you can:
echo - Access phpMyAdmin at: http://localhost/phpmyadmin
echo - Run your Flask application
echo.
echo Press any key to test database connection...
pause > nul

echo.
echo Testing database connection...
python test_database_connection.py

echo.
echo Setup complete! Your database is ready to use.
pause

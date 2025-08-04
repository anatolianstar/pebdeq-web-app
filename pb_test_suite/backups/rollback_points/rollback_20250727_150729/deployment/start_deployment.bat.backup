@echo off
echo ================================================
echo PEBDEQ DEPLOYMENT TOOL STARTER
echo ================================================
echo.

:: Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.7+ from https://python.org
    pause
    exit /b 1
)

:: Check if requirements are installed
echo Checking and installing requirements...
pip install -r deployment_requirements.txt

if errorlevel 1 (
    echo ERROR: Failed to install requirements
    pause
    exit /b 1
)

:: Start the deployment GUI
echo.
echo Starting PEBDEQ Deployment Tool...
echo.
python deployment_gui.py

if errorlevel 1 (
    echo.
    echo ERROR: Failed to start deployment tool
    pause
    exit /b 1
)

pause 
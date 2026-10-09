@echo off
setlocal

set "ROOT=%~dp0"
set "FRONTEND_DIR=%ROOT%frontend"
set "BACKEND_DIR=%ROOT%backend"
set "PYTHON_CMD="

where npm >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js and npm are required to start the frontend.
    echo Install Node.js, then run this script again.
    pause
    exit /b 1
)

if not exist "%FRONTEND_DIR%\node_modules\.bin\vite.cmd" (
    echo Frontend dependencies are missing. Installing from package-lock.json...
    pushd "%FRONTEND_DIR%"
    call npm install
    if errorlevel 1 (
        popd
        echo [ERROR] Frontend dependency installation failed.
        pause
        exit /b 1
    )
    popd
)

where py >nul 2>&1
if not errorlevel 1 (
    py -3 --version >nul 2>&1
    if not errorlevel 1 set "PYTHON_CMD=py -3"
)

if not defined PYTHON_CMD (
    where python >nul 2>&1
    if not errorlevel 1 (
        python --version >nul 2>&1
        if not errorlevel 1 set "PYTHON_CMD=python"
    )
)

if defined PYTHON_CMD (
    curl.exe --silent --fail http://127.0.0.1:5001/api/health >nul 2>&1
    if errorlevel 1 (
        start "AgriSentinal Backend" cmd /k "cd /d ""%BACKEND_DIR%"" && %PYTHON_CMD% flask_server.py"
    ) else (
        echo Backend already running at http://localhost:5001
    )
) else (
    echo [WARNING] Python was not found. The backend will not start.
    echo Install Python 3 and run: python -m pip install -r backend\requirements.txt
)

curl.exe --silent --fail http://127.0.0.1:5173/ >nul 2>&1
if errorlevel 1 (
    start "AgriSentinal Frontend" cmd /k "cd /d ""%FRONTEND_DIR%"" && npm run dev -- --host 127.0.0.1 --strictPort"
) else (
    echo Frontend already running at http://localhost:5173
)

echo Frontend: http://localhost:5173
if defined PYTHON_CMD echo Backend:  http://localhost:5001
echo Close the opened terminal windows to stop the servers.

@echo off
setlocal enabledelayedexpansion

title TRACE-X Launcher (SIH26151)
color 0A

echo ===============================================================================
echo   TRACE-X: Threat Actor Correlation and Attribution Engine
echo   Smart India Hackathon (SIH26151) - NTRO Software Edition
echo   Windows 1-Click Startup Script
echo ===============================================================================
echo.

:: Get script directory
set "ROOT_DIR=%~dp0"
cd /d "%ROOT_DIR%"

:: 1. Verify Python Installation
echo [*] Checking Python installation...
where python >nul 2>nul
if %errorlevel% neq 0 (
    where py >nul 2>nul
    if %errorlevel% neq 0 (
        color 0C
        echo [ERROR] Python 3.10+ was not found in your system PATH!
        echo Please download and install Python from: https://www.python.org/downloads/
        echo IMPORTANT: Check the box "Add python.exe to PATH" during installation.
        pause
        exit /b 1
    ) else (
        set "PY_CMD=py -3"
    )
) else (
    set "PY_CMD=python"
)

:: 2. Verify Node.js and NPM
echo [*] Checking Node.js and NPM...
where node >nul 2>nul
if %errorlevel% neq 0 (
    color 0C
    echo [ERROR] Node.js was not found in your system PATH!
    echo Please download and install Node.js (LTS recommended) from: https://nodejs.org/
    pause
    exit /b 1
)

where npm >nul 2>nul
if %errorlevel% neq 0 (
    color 0C
    echo [ERROR] npm was not found in your system PATH!
    pause
    exit /b 1
)

:: 3. Setup Python Virtual Environment
echo [*] Checking Python virtual environment (backend\venv)...
if not exist "backend\venv\Scripts\activate.bat" (
    echo [i] Creating Python virtual environment in backend\venv...
    %PY_CMD% -m venv backend\venv
    if %errorlevel% neq 0 (
        color 0C
        echo [ERROR] Failed to create Python virtual environment.
        pause
        exit /b 1
    )
    echo [i] Installing Python dependencies from backend\requirements.txt...
    backend\venv\Scripts\python.exe -m pip install --upgrade pip
    backend\venv\Scripts\python.exe -m pip install -r backend\requirements.txt
) else (
    echo [OK] Python virtual environment detected.
)

:: 4. Setup Frontend Node Dependencies
echo [*] Checking Frontend dependencies (frontend\node_modules)...
if not exist "frontend\node_modules" (
    echo [i] Installing npm packages in frontend...
    cd frontend
    call npm install
    cd ..
) else (
    echo [OK] Frontend dependencies detected.
)

:: 5. Launch Backend in separate Command Prompt window
echo.
echo ===============================================================================
echo [1/2] Launching FastAPI Backend on http://localhost:8000 ...
echo ===============================================================================
start "TRACE-X Backend (Port 8000)" cmd /k "cd /d "%ROOT_DIR%" && call backend\venv\Scripts\activate.bat && python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload"

:: Wait 2 seconds for backend initialization
timeout /t 2 /nobreak >nul

:: 6. Launch Frontend in separate Command Prompt window
echo ===============================================================================
echo [2/2] Launching React Vite Frontend on http://localhost:5173 ...
echo ===============================================================================
start "TRACE-X Frontend (Port 5173)" cmd /k "cd /d "%ROOT_DIR%frontend" && npm run dev"

:: Wait 3 seconds then open browser
timeout /t 3 /nobreak >nul
start http://localhost:5173

echo.
echo ===============================================================================
echo   TRACE-X IS RUNNING SUCCESSFULLY ON WINDOWS!
echo -------------------------------------------------------------------------------
echo   Web Application:     http://localhost:5173
echo   REST API Backend:    http://localhost:8000
echo   API Swagger Docs:    http://localhost:8000/docs
echo   Alternative Docs:    http://localhost:8000/redoc
echo ===============================================================================
echo.
echo To shut down TRACE-X, simply close the two open server command prompt windows.
echo.
pause

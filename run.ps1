<#
.SYNOPSIS
    TRACE-X PowerShell 1-Click Startup Script (SIH26151)
.DESCRIPTION
    Launches FastAPI backend and React frontend concurrently on Windows.
#>

$ErrorActionPreference = "Stop"

Write-Host "===============================================================================" -ForegroundColor Cyan
Write-Host "  TRACE-X: Threat Actor Correlation and Attribution Engine" -ForegroundColor Green
Write-Host "  Smart India Hackathon (SIH26151) - Windows PowerShell Launcher" -ForegroundColor Cyan
Write-Host "===============================================================================" -ForegroundColor Cyan
Write-Host ""

$RootDir = $PSScriptRoot
Set-Location $RootDir

# 1. Verify Python
Write-Host "[*] Checking Python..." -ForegroundColor Yellow
$PythonCmd = $null
if (Get-Command python -ErrorAction SilentlyContinue) {
    $PythonCmd = "python"
} elseif (Get-Command py -ErrorAction SilentlyContinue) {
    $PythonCmd = "py -3"
} else {
    Write-Host "[ERROR] Python 3.10+ not found in PATH! Download from https://www.python.org/" -ForegroundColor Red
    exit 1
}

# 2. Verify Node and NPM
Write-Host "[*] Checking Node.js and NPM..." -ForegroundColor Yellow
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "[ERROR] Node.js not found in PATH! Download from https://nodejs.org/" -ForegroundColor Red
    exit 1
}
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Host "[ERROR] npm not found in PATH!" -ForegroundColor Red
    exit 1
}

# 3. Setup venv if missing
$VenvDir = Join-Path $RootDir "backend\venv"
$VenvActivate = Join-Path $VenvDir "Scripts\Activate.ps1"

if (-not (Test-Path $VenvActivate)) {
    Write-Host "[i] Creating virtual environment in backend\venv..." -ForegroundColor Cyan
    & $PythonCmd -m venv $VenvDir
    Write-Host "[i] Installing backend dependencies..." -ForegroundColor Cyan
    & "$VenvDir\Scripts\python.exe" -m pip install --upgrade pip
    & "$VenvDir\Scripts\python.exe" -m pip install -r (Join-Path $RootDir "backend\requirements.txt")
} else {
    Write-Host "[OK] Python virtual environment ready." -ForegroundColor Green
}

# 4. Setup frontend modules if missing
$FrontendNodeModules = Join-Path $RootDir "frontend\node_modules"
if (-not (Test-Path $FrontendNodeModules)) {
    Write-Host "[i] Installing frontend npm packages..." -ForegroundColor Cyan
    Push-Location (Join-Path $RootDir "frontend")
    npm install
    Pop-Location
} else {
    Write-Host "[OK] Frontend packages ready." -ForegroundColor Green
}

# 5. Launch Backend
Write-Host "`n[1/2] Launching Backend on http://localhost:8000..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$RootDir'; & '$VenvActivate'; python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload"

Start-Sleep -Seconds 2

# 6. Launch Frontend
Write-Host "[2/2] Launching Frontend on http://localhost:5173..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$RootDir\frontend'; npm run dev"

Start-Sleep -Seconds 2
Start-Process "http://localhost:5173"

Write-Host "`n===============================================================================" -ForegroundColor Green
Write-Host "  TRACE-X IS RUNNING!" -ForegroundColor Green
Write-Host "  Frontend:  http://localhost:5173" -ForegroundColor White
Write-Host "  API Docs:  http://localhost:8000/docs" -ForegroundColor White
Write-Host "===============================================================================" -ForegroundColor Green

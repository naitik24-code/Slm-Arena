@echo off
setlocal
cd /d "%~dp0"
title SLM Arena

echo.
echo  SLM Arena - local launcher
echo  =========================
echo.

where docker >nul 2>&1
if errorlevel 1 (
  echo Docker was not found. Install Docker Desktop and try again.
  pause
  exit /b 1
)

docker info >nul 2>&1
if errorlevel 1 (
  echo Docker Desktop is not running. Start it, then run start.bat again.
  pause
  exit /b 1
)

curl.exe --silent --fail http://localhost:11434/api/tags >nul 2>&1
if errorlevel 1 echo Ollama is not responding. The app will start, but model runs need Ollama.

echo Building and starting the app...
docker compose up --build -d
if errorlevel 1 (
  echo.
  echo Startup failed. Check Docker Desktop and the messages above.
  pause
  exit /b 1
)

echo Waiting for the API...
for /L %%i in (1,1,30) do (
  curl.exe --silent --fail http://localhost/api/health >nul 2>&1
  if not errorlevel 1 goto ready
  timeout /t 2 /nobreak >nul
)

echo The API is still starting. You can inspect it with: docker compose logs -f
:ready
echo Opening SLM Arena at http://localhost
start "" "http://localhost"
echo.
echo To stop the app later, run: docker compose down
pause

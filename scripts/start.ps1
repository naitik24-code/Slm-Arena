# Check if Ollama is running
Write-Host "Checking if Ollama is running..." -ForegroundColor Cyan
try {
    $res = Invoke-RestMethod -Uri "http://localhost:11434/api/tags" -Method Get -ErrorAction Stop
    Write-Host "[OK] Ollama is running." -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Ollama is NOT running!" -ForegroundColor Red
    Write-Host "Please start Ollama from your system tray or run 'ollama serve' and try again." -ForegroundColor Yellow
    exit 1
}

# Check if Docker Desktop is running
Write-Host "Checking if Docker is running..." -ForegroundColor Cyan
docker info >$null 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Docker Desktop is NOT running!" -ForegroundColor Red
    Write-Host "Please start Docker Desktop and try again." -ForegroundColor Yellow
    exit 1
}
Write-Host "[OK] Docker is running." -ForegroundColor Green

# Start the application
Write-Host "Starting SLM Arena with Docker Compose..." -ForegroundColor Green
docker compose up --build

# After Ctrl+C, bring everything down
docker compose down

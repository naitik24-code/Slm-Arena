$ErrorActionPreference = "Stop"

$models = @("mistral", "phi3", "llama3")
$ollamaUrl = "http://localhost:11434/api/tags"

try {
    # 1. Checks if Ollama is running at http://localhost:11434/api/tags
    $response = Invoke-RestMethod -Uri $ollamaUrl -Method Get
    Write-Host "Ollama is running." -ForegroundColor Green
} catch {
    # 2. If not running, prints a clear error
    Write-Host "Error: Ollama is not running! Please start Ollama from the system tray." -ForegroundColor Red
    exit 1
}

$pulledModels = @()
if ($null -ne $response.models) {
    $pulledModels = @($response.models.name)
}

$success = $true

# 3. Loops through ["mistral", "phi3", "llama3"]
foreach ($model in $models) {
    $found = $false
    foreach ($pm in $pulledModels) {
        # Check for exact name or with a tag (like model:latest)
        if ($pm -match "^$model(:|$)") {
            $found = $true
            break
        }
    }

    if ($found) {
        # 5. Prints colored status output
        Write-Host "Model '$model' is already pulled." -ForegroundColor Green
    } else {
        Write-Host "Model '$model' not found. Pulling..." -ForegroundColor Yellow
        try {
            # 4. Auto-pulls any missing model
            & ollama pull $model
            if ($LASTEXITCODE -ne 0) {
                Write-Host "Error pulling '$model'." -ForegroundColor Red
                $success = $false
            } else {
                Write-Host "Model '$model' pulled successfully." -ForegroundColor Green
            }
        } catch {
            Write-Host "Failed to execute 'ollama pull'. Make sure ollama is in your PATH." -ForegroundColor Red
            $success = $false
        }
    }
}

# 6. Exits with code 0 on success, 1 on failure
if (-Not $success) {
    exit 1
}
exit 0

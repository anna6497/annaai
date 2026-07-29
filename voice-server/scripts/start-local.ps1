$ErrorActionPreference = "Stop"

Set-Location (Split-Path -Parent $PSScriptRoot)

if (-not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host "Created .env from .env.example"
}

try {
    Invoke-RestMethod -Uri "http://127.0.0.1:11434/api/tags" -TimeoutSec 5 | Out-Null
} catch {
    Write-Error "Ollama is not running. Start Ollama first, then run this script again."
}

docker compose up -d --build
Write-Host "Anna AI API is starting at http://localhost:8000"
Write-Host "Docs: http://localhost:8000/docs"

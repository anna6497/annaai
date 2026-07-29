$ErrorActionPreference = "Stop"
$response = Invoke-RestMethod -Uri "http://localhost:8000/health" -TimeoutSec 30
$response | ConvertTo-Json -Depth 5

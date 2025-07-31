Write-Host "Checking if server is running on port 5000..."
Start-Sleep -Seconds 2

try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/health" -UseBasicParsing -TimeoutSec 5
    Write-Host "✅ Server is running!" -ForegroundColor Green
    Write-Host "Status Code: $($response.StatusCode)"
    Write-Host "Response: $($response.Content)"
} catch {
    Write-Host "❌ Server is not responding on port 5000" -ForegroundColor Red
    Write-Host "Error: $_"
    Write-Host ""
    Write-Host "Attempting to start the server..."
    
    # Start the server in a new window
    Start-Process cmd -ArgumentList "/k cd /d $((Get-Location).Path)\server && node server.js" -WindowStyle Normal
    Write-Host "Server starting in a new window. Please check for any error messages there."
}

Write-Host ""
Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
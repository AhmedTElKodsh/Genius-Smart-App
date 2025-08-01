# PowerShell script to clear all data files
Write-Host "Clearing data files..." -ForegroundColor Yellow

# List of files to clear
$files = @(
    "attendance.json",
    "requests.json",
    "all_requests.json",
    "manager_requests.json",
    "action_audit.json",
    "data_tracking.json"
)

# Clear each file
foreach ($file in $files) {
    if (Test-Path $file) {
        Set-Content -Path $file -Value "[]"
        Write-Host "Cleared $file" -ForegroundColor Green
    } else {
        Write-Host "File $file not found" -ForegroundColor Red
    }
}

Write-Host "All data files cleared!" -ForegroundColor Green
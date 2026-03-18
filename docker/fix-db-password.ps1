# ============================================
# Fix Database Password Issue
# ============================================
# Usage: .\fix-db-password.ps1
# ============================================

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "   Database Password Fix" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[ISSUE FOUND] Database password authentication failed!" -ForegroundColor Red
Write-Host ""
Write-Host "Possible causes:" -ForegroundColor Yellow
Write-Host "  1. Password in .env file doesn't match database" -ForegroundColor Gray
Write-Host "  2. Database user password was changed" -ForegroundColor Gray
Write-Host "  3. Environment variable not loaded" -ForegroundColor Gray
Write-Host ""

$choice = Read-Host "What do you want to do? (1/2/3)"

if ($choice -eq '1') {
    # Option 1: Reset password in database
    Write-Host ""
    Write-Host "[Step 1/3] Resetting database password..." -ForegroundColor Yellow
    
    $newPassword = Read-Host "Enter new password (or press Enter for 'blog123')"
    if ([string]::IsNullOrWhiteSpace($newPassword)) {
        $newPassword = "blog123"
    }
    
    # Reset password in PostgreSQL
    docker exec blog-postgres psql -U postgres -d blog -c "ALTER USER blog WITH PASSWORD '$newPassword';"
    
    Write-Host "[OK] Password reset in database" -ForegroundColor Green
    Write-Host ""
    
    # Update .env file
    Write-Host "[Step 2/3] Updating .env file..." -ForegroundColor Yellow
    $envPath = "$PSScriptRoot\.env"
    if (Test-Path $envPath) {
        $content = Get-Content $envPath -Raw
        $content = $content -replace '(DB_PASSWORD=).*', "`$1$newPassword"
        Set-Content $envPath $content -NoNewline
        Write-Host "[OK] .env file updated" -ForegroundColor Green
    } else {
        Write-Host "Creating .env file..." -ForegroundColor Yellow
        @"
# Database Configuration
DB_PASSWORD=$newPassword

# Meilisearch Configuration
MEILI_MASTER_KEY=blogSearchKey
"@ | Set-Content $envPath
        Write-Host "[OK] .env file created" -ForegroundColor Green
    }
    Write-Host ""
    
    # Restart services
    Write-Host "[Step 3/3] Restarting services..." -ForegroundColor Yellow
    cd $PSScriptRoot
    docker-compose restart web-api admin-api
    Start-Sleep -Seconds 10
    Write-Host "[OK] Services restarted" -ForegroundColor Green
    
} elseif ($choice -eq '2') {
    # Option 2: Check current password
    Write-Host ""
    Write-Host "Checking current .env configuration..." -ForegroundColor Yellow
    $envPath = "$PSScriptRoot\.env"
    if (Test-Path $envPath) {
        $dbPassword = Select-String -Path $envPath -Pattern "DB_PASSWORD=(.*)" | ForEach-Object { $_.Matches.Groups[1].Value }
        Write-Host "Current password in .env: $dbPassword" -ForegroundColor Cyan
        
        Write-Host ""
        Write-Host "Testing connection with this password..." -ForegroundColor Yellow
        docker exec blog-postgres psql -U blog -d blog -c "SELECT 1;" 2>&1 | Out-Null
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "[OK] Password is correct, connection successful" -ForegroundColor Green
        } else {
            Write-Host "[ERROR] Password is incorrect!" -ForegroundColor Red
            Write-Host "Try resetting password (option 1)" -ForegroundColor Yellow
        }
    } else {
        Write-Host "[WARNING] .env file not found!" -ForegroundColor Red
        Write-Host "Using default password: blog123" -ForegroundColor Yellow
    }
    
} elseif ($choice -eq '3') {
    # Option 3: View logs
    Write-Host ""
    Write-Host "Latest database connection errors:" -ForegroundColor Yellow
    docker-compose logs web-api 2>&1 | Select-String "password authentication failed" | Select-Object -Last 5
}

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "   Next Steps" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "After fixing password, verify connection:" -ForegroundColor Yellow
Write-Host "  .\check-backend.ps1" -ForegroundColor Cyan
Write-Host ""

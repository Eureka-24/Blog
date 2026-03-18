# ============================================
# Check Backend Services Status
# ============================================
# Usage: .\check-backend.ps1
# ============================================

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "   Backend Services Health Check" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$WEB_API_PORT = 8080
$ADMIN_API_PORT = 8081

Write-Host "[Step 1/5] Checking Docker containers..." -ForegroundColor Yellow
Write-Host ""

# Check container status
$containers = docker-compose ps
Write-Host $containers
Write-Host ""

# Check if containers are running
$webApiRunning = $containers -match "blog-web-api.*Up"
$adminApiRunning = $containers -match "blog-admin-api.*Up"
$postgresRunning = $containers -match "blog-postgres.*Up"

if (-not $webApiRunning) {
    Write-Host "[WARNING] Web API container is not running!" -ForegroundColor Red
} else {
    Write-Host "[OK] Web API container is running" -ForegroundColor Green
}

if (-not $adminApiRunning) {
    Write-Host "[WARNING] Admin API container is not running!" -ForegroundColor Red
} else {
    Write-Host "[OK] Admin API container is running" -ForegroundColor Green
}

if (-not $postgresRunning) {
    Write-Host "[WARNING] PostgreSQL container is not running!" -ForegroundColor Red
} else {
    Write-Host "[OK] PostgreSQL container is running" -ForegroundColor Green
}

Write-Host ""
Write-Host "[Step 2/5] Testing API endpoints..." -ForegroundColor Yellow
Write-Host ""

# Test Web API
Write-Host "Testing Web API (http://localhost:$WEB_API_PORT)..." -ForegroundColor Cyan
try {
    $webResponse = Invoke-WebRequest -Uri "http://localhost:$WEB_API_PORT/actuator/health" -TimeoutSec 5 -UseBasicParsing
    if ($webResponse.StatusCode -eq 200) {
        Write-Host "[OK] Web API is responding (Status: $($webResponse.StatusCode))" -ForegroundColor Green
    } else {
        Write-Host "[WARNING] Web API responded with status: $($webResponse.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "[ERROR] Web API is not responding!" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Gray
}
Write-Host ""

# Test Admin API
Write-Host "Testing Admin API (http://localhost:$ADMIN_API_PORT)..." -ForegroundColor Cyan
try {
    $adminResponse = Invoke-WebRequest -Uri "http://localhost:$ADMIN_API_PORT/actuator/health" -TimeoutSec 5 -UseBasicParsing
    if ($adminResponse.StatusCode -eq 200) {
        Write-Host "[OK] Admin API is responding (Status: $($adminResponse.StatusCode))" -ForegroundColor Green
    } else {
        Write-Host "[WARNING] Admin API responded with status: $($adminResponse.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "[ERROR] Admin API is not responding!" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Gray
}
Write-Host ""

Write-Host "[Step 3/5] Checking database connection..." -ForegroundColor Yellow
Write-Host ""

# Test database connection via docker exec
try {
    $dbTest = docker exec blog-postgres psql -U blog -d blog -c "SELECT 1;" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[OK] PostgreSQL is accessible" -ForegroundColor Green
    } else {
        Write-Host "[ERROR] Cannot connect to PostgreSQL!" -ForegroundColor Red
    }
} catch {
    Write-Host "[ERROR] PostgreSQL connection failed!" -ForegroundColor Red
}
Write-Host ""

Write-Host "[Step 4/5] Checking recent logs..." -ForegroundColor Yellow
Write-Host ""

Write-Host "Web API latest logs:" -ForegroundColor Cyan
docker-compose logs --tail=5 web-api 2>$null | ForEach-Object {
    if ($_ -match "Started") {
        Write-Host "  $_" -ForegroundColor Green
    } else {
        Write-Host "  $_" -ForegroundColor Gray
    }
}
Write-Host ""

Write-Host "Admin API latest logs:" -ForegroundColor Cyan
docker-compose logs --tail=5 admin-api 2>$null | ForEach-Object {
    if ($_ -match "Started") {
        Write-Host "  $_" -ForegroundColor Green
    } else {
        Write-Host "  $_" -ForegroundColor Gray
    }
}
Write-Host ""

Write-Host "[Step 5/5] Testing article API..." -ForegroundColor Yellow
Write-Host ""

# Test getting articles
try {
    $articles = Invoke-RestMethod -Uri "http://localhost:$WEB_API_PORT/api/articles?page=1&size=5" -TimeoutSec 5
    Write-Host "[OK] Article API is working" -ForegroundColor Green
    Write-Host "  Total articles: $($articles.total)" -ForegroundColor Gray
    if ($articles.records -and $articles.records.Count -gt 0) {
        Write-Host "  Latest article:" -ForegroundColor Gray
        $latest = $articles.records[0]
        Write-Host "    Title: $($latest.title)" -ForegroundColor Cyan
        Write-Host "    Slug: $($latest.slug)" -ForegroundColor $(if ($latest.slug) { "Green" } else { "Red" })
    }
} catch {
    Write-Host "[ERROR] Failed to fetch articles!" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Gray
}
Write-Host ""

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "   Health Check Summary" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

$allOk = $webApiRunning -and $adminApiRunning -and $postgresRunning

if ($allOk) {
    Write-Host "[SUCCESS] All services are running normally!" -ForegroundColor Green
} else {
    Write-Host "[ISSUE] Some services are not running properly" -ForegroundColor Red
    Write-Host ""
    Write-Host "Try to restart all services:" -ForegroundColor Yellow
    Write-Host "  docker-compose up -d" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "Service URLs:" -ForegroundColor Yellow
Write-Host "  Web API:    http://localhost:$WEB_API_PORT" -ForegroundColor Cyan
Write-Host "  Admin API:  http://localhost:$ADMIN_API_PORT" -ForegroundColor Cyan
Write-Host "  Frontend:   http://localhost:3000" -ForegroundColor Cyan
Write-Host "  Admin UI:   http://localhost:5173" -ForegroundColor Cyan
Write-Host ""

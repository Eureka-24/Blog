# ============================================
# Blog System - Rebuild and Restart All Services
# ============================================
# Usage: .\rebuild-and-restart.ps1
# ============================================

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "   Rebuild & Restart All Services" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Build backend
Write-Host "[Step 1/5] Building backend..." -ForegroundColor Yellow
cd $PSScriptRoot\..\blog-api
mvn clean install -DskipTests

if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Backend build failed!" -ForegroundColor Red
    exit 1
}
Write-Host "[OK] Backend build completed" -ForegroundColor Green
Write-Host ""

# Step 2: Restart Docker services
Write-Host "[Step 2/5] Restarting Docker services..." -ForegroundColor Yellow
cd $PSScriptRoot\docker
docker-compose restart web-api admin-api

if ($LASTEXITCODE -ne 0) {
    Write-Host "[WARNING] Docker restart failed. Trying to start all services..." -ForegroundColor Yellow
    docker-compose up -d
}
Write-Host "[OK] Docker services restarted" -ForegroundColor Green
Write-Host ""

# Step 3: Wait for services to be ready
Write-Host "[Step 3/5] Waiting for services to start (10 seconds)..." -ForegroundColor Yellow
Start-Sleep -Seconds 10
Write-Host "[OK] Services should be ready" -ForegroundColor Green
Write-Host ""

# Step 4: Check service status
Write-Host "[Step 4/5] Checking service status..." -ForegroundColor Yellow
$services = docker-compose ps
Write-Host $services
Write-Host ""

# Step 5: Instructions for frontend
Write-Host "[Step 5/5] Frontend restart instructions:" -ForegroundColor Yellow
Write-Host ""
Write-Host "Please restart the frontend manually:" -ForegroundColor Gray
Write-Host "  cd ..\blog-web" -ForegroundColor Cyan
Write-Host "  # Press Ctrl+C to stop current server" -ForegroundColor Gray
Write-Host "  rm -r .next" -ForegroundColor Cyan
Write-Host "  npm run dev" -ForegroundColor Cyan
Write-Host ""

Write-Host "=====================================" -ForegroundColor Green
Write-Host "   Backend Ready!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host ""
Write-Host "API Endpoints:" -ForegroundColor Yellow
Write-Host "  Web API:    http://localhost:8080" -ForegroundColor Cyan
Write-Host "  Admin API:  http://localhost:8081" -ForegroundColor Cyan
Write-Host ""
Write-Host "Test creating a new article with Chinese title at:" -ForegroundColor Yellow
Write-Host "  http://localhost:5173" -ForegroundColor Cyan
Write-Host ""

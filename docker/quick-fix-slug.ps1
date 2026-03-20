# ============================================
# Quick Fix: Rebuild Backend and Restart
# ============================================
# Usage: .\quick-fix-slug.ps1
# ============================================

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "   Quick Fix: Slug Generation Issue" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "This will:" -ForegroundColor Yellow
Write-Host "  1. Rebuild backend Java code" -ForegroundColor Gray
Write-Host "  2. Build new Docker images" -ForegroundColor Gray
Write-Host "  3. Start services with new code" -ForegroundColor Gray
Write-Host "  4. Test slug generation" -ForegroundColor Gray
Write-Host ""

$confirm = Read-Host "Continue? (y/n)"
if ($confirm -ne 'y' -and $confirm -ne 'Y') {
    Write-Host "Cancelled." -ForegroundColor Red
    exit
}

Write-Host ""
Write-Host "[Step 1/4] Building backend..." -ForegroundColor Yellow
cd $PSScriptRoot\..\blog-api
mvn clean install -DskipTests

if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Build failed!" -ForegroundColor Red
    exit 1
}
Write-Host "[OK] Build completed" -ForegroundColor Green
Write-Host ""

Write-Host "[Step 2/4] Building Docker images (this may take a minute)..." -ForegroundColor Yellow
cd $PSScriptRoot
docker-compose build web-api admin-api landing

if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Docker build failed!" -ForegroundColor Red
    exit 1
}
Write-Host "[OK] Images built successfully" -ForegroundColor Green
Write-Host ""

Write-Host "[Step 3/4] Starting services with new images..." -ForegroundColor Yellow
docker-compose up -d web-api admin-api landing
Start-Sleep -Seconds 10
Write-Host "[OK] Services started" -ForegroundColor Green
Write-Host ""

Write-Host "[Step 4/4] Checking service status..." -ForegroundColor Yellow
docker-compose ps
Write-Host ""

Write-Host "=====================================" -ForegroundColor Green
Write-Host "   Fix Applied!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Go to http://localhost:5173" -ForegroundColor Cyan
Write-Host "  2. Create a NEW article with Chinese title" -ForegroundColor Gray
Write-Host "  3. Check if slug is generated" -ForegroundColor Gray
Write-Host ""
Write-Host "Debug command:" -ForegroundColor Cyan
Write-Host "  .\debug-slug.ps1" -ForegroundColor Gray
Write-Host ""

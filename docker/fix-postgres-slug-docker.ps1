# ============================================
# Blog System - PostgreSQL Slug Fix (Docker exec)
# ============================================
# Usage: .\fix-postgres-slug-docker.ps1
# ============================================

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "   PostgreSQL Slug Fix (Docker)" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Database configuration
$PG_USER = "blog"
$PG_DATABASE = "blog"

Write-Host "Database Configuration:" -ForegroundColor Yellow
Write-Host "  User: $PG_USER" -ForegroundColor Gray
Write-Host "  Database: $PG_DATABASE" -ForegroundColor Gray
Write-Host ""

# Check if Docker is running
try {
    $dockerVersion = docker --version
    Write-Host "[OK] Docker installed: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Docker not found!" -ForegroundColor Red
    exit 1
}

# Check if container is running
Write-Host "Checking container status..." -ForegroundColor Cyan
$containerStatus = docker ps --filter "name=blog-postgres" --format "{{.Status}}"

if ($containerStatus) {
    Write-Host "[OK] Container is running" -ForegroundColor Green
} else {
    Write-Host "[WARNING] Container not running. Starting..." -ForegroundColor Yellow
    docker-compose up -d postgres
    Start-Sleep -Seconds 5
}

Write-Host ""
Write-Host "Executing SQL fix script..." -ForegroundColor Cyan
Write-Host ""

# SQL commands
$sqlBefore = "SELECT 'Before Fix:' AS info; SELECT id, title, slug FROM article WHERE slug IS NULL OR slug = '' LIMIT 10;"
$sqlCount = "SELECT CONCAT('Articles to update: ', COUNT(*)) AS need_update FROM article WHERE slug IS NULL OR slug = '';"
$sqlUpdate = "UPDATE article SET slug = CONCAT('post-', id), update_time = CURRENT_TIMESTAMP WHERE slug IS NULL OR slug = '';"
$sqlAfter = "SELECT 'After Fix:' AS info; SELECT id, title, slug FROM article ORDER BY id DESC LIMIT 10;"
$sqlCheck = "SELECT 'Check Duplicates:' AS info; SELECT slug, COUNT(*) as count FROM article GROUP BY slug HAVING COUNT(*) > 1;"
$sqlStats = "SELECT 'Statistics:' AS info; SELECT COUNT(*) AS total, COUNT(DISTINCT slug) AS unique_slugs FROM article;"

# Execute SQL commands
Write-Host "=== Before Fix ===" -ForegroundColor Cyan
docker exec -it blog-postgres psql -U $PG_USER -d $PG_DATABASE -c "$sqlBefore"

Write-Host ""
Write-Host "=== Count Articles ===" -ForegroundColor Cyan
docker exec -it blog-postgres psql -U $PG_USER -d $PG_DATABASE -c "$sqlCount"

Write-Host ""
Write-Host "=== Executing Update ===" -ForegroundColor Cyan
docker exec -it blog-postgres psql -U $PG_USER -d $PG_DATABASE -c "$sqlUpdate"

Write-Host ""
Write-Host "=== After Fix ===" -ForegroundColor Cyan
docker exec -it blog-postgres psql -U $PG_USER -d $PG_DATABASE -c "$sqlAfter"

Write-Host ""
Write-Host "=== Check Duplicates ===" -ForegroundColor Cyan
docker exec -it blog-postgres psql -U $PG_USER -d $PG_DATABASE -c "$sqlCheck"

Write-Host ""
Write-Host "=== Statistics ===" -ForegroundColor Cyan
docker exec -it blog-postgres psql -U $PG_USER -d $PG_DATABASE -c "$sqlStats"

Write-Host ""
Write-Host "=====================================" -ForegroundColor Green
Write-Host "   Slug Fix Completed!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Restart Next.js dev server:" -ForegroundColor Gray
Write-Host "   cd ..\blog-web" -ForegroundColor Cyan
Write-Host "   rm -r .next" -ForegroundColor Cyan
Write-Host "   npm run dev" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. Test at http://localhost:3000" -ForegroundColor Gray
Write-Host ""

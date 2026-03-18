# ============================================
# Blog System - PostgreSQL Slug Fix Script
# ============================================
# Usage: .\fix-postgres-slug.ps1
# ============================================

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "   PostgreSQL Slug Fix Tool" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Database configuration (from docker-compose.yml)
$PG_HOST = "localhost"
$PG_PORT = "5432"
$PG_USER = "blog"
$PG_DATABASE = "blog"
$PG_PASSWORD = "blog123"

Write-Host "Database Configuration:" -ForegroundColor Yellow
Write-Host "  Host: $PG_HOST`:$PG_PORT" -ForegroundColor Gray
Write-Host "  User: $PG_USER" -ForegroundColor Gray
Write-Host "  Database: $PG_DATABASE" -ForegroundColor Gray
Write-Host ""

# Check if psql is installed
try {
    $psqlVersion = psql --version
    Write-Host "[OK] psql installed: $psqlVersion" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] psql not found. Please ensure PostgreSQL is installed." -ForegroundColor Red
    Write-Host "Tip: If using Docker, connect to container:" -ForegroundColor Yellow
    Write-Host "  docker exec -it blog-postgres psql -U blog -d blog" -ForegroundColor Gray
    exit 1
}

# SQL script
$sqlScript = @"
SELECT 'Before Fix:' AS info;
SELECT id, title, slug FROM article WHERE slug IS NULL OR slug = '' LIMIT 10;

SELECT CONCAT('Articles to update: ', COUNT(*)) AS need_update 
FROM article WHERE slug IS NULL OR slug = '';

UPDATE article SET slug = CONCAT('post-', id), update_time = CURRENT_TIMESTAMP 
WHERE slug IS NULL OR slug = '';

SELECT 'After Fix:' AS info;
SELECT id, title, slug FROM article ORDER BY id DESC LIMIT 10;

SELECT 'Check Duplicates:' AS info;
SELECT slug, COUNT(*) as count FROM article GROUP BY slug HAVING COUNT(*) > 1;

SELECT 'Statistics:' AS info;
SELECT COUNT(*) AS total, COUNT(DISTINCT slug) AS unique_slugs FROM article;

SELECT 'Slug fix completed!' AS status;
"@

Write-Host "Executing SQL fix script..." -ForegroundColor Cyan
Write-Host ""

# Set password environment variable
$env:PGPASSWORD = $PG_PASSWORD

# Execute SQL
try {
    $output = psql -h $PG_HOST -p $PG_PORT -U $PG_USER -d $PG_DATABASE -c "$sqlScript" 2>&1
    Write-Host $output -ForegroundColor White
} catch {
    Write-Host "[ERROR] Failed to execute: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Troubleshooting:" -ForegroundColor Yellow
    Write-Host "1. Check if PostgreSQL is running" -ForegroundColor Gray
    Write-Host "2. Verify database credentials" -ForegroundColor Gray
    Write-Host "3. If using Docker, start container:" -ForegroundColor Gray
    Write-Host "   docker-compose up -d postgres" -ForegroundColor Cyan
    exit 1
}

# Clear password from environment
Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue

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

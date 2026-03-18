# ============================================
# Blog System - Connect to PostgreSQL
# ============================================
# Usage: .\connect-db.ps1
# ============================================

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "   PostgreSQL Database Connection" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

$PG_USER = "blog"
$PG_DATABASE = "blog"

Write-Host "Database Info:" -ForegroundColor Yellow
Write-Host "  Host: localhost:5432" -ForegroundColor Gray
Write-Host "  User: $PG_USER" -ForegroundColor Gray
Write-Host "  Database: $PG_DATABASE" -ForegroundColor Gray
Write-Host "  Password: blog123" -ForegroundColor Gray
Write-Host ""

Write-Host "Connection Methods:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Docker exec (Recommended):" -ForegroundColor Cyan
Write-Host "   docker exec -it blog-postgres psql -U $PG_USER -d $PG_DATABASE" -ForegroundColor Gray
Write-Host ""
Write-Host "2. psql command line:" -ForegroundColor Cyan
Write-Host "   psql -h localhost -p 5432 -U $PG_USER -d $PG_DATABASE" -ForegroundColor Gray
Write-Host ""
Write-Host "3. GUI Tools:" -ForegroundColor Cyan
Write-Host "   - pgAdmin" -ForegroundColor Gray
Write-Host "   - DBeaver" -ForegroundColor Gray
Write-Host "   - DataGrip" -ForegroundColor Gray
Write-Host ""

Write-Host "Common SQL Commands:" -ForegroundColor Yellow
Write-Host "  \dt              - List all tables" -ForegroundColor Gray
Write-Host "  \d article       - Describe article table" -ForegroundColor Gray
Write-Host "  SELECT * FROM article;" -ForegroundColor Gray
Write-Host "  \q               - Quit" -ForegroundColor Gray
Write-Host ""

Write-Host "Opening connection..." -ForegroundColor Green
Write-Host ""

# Try to connect using docker exec
docker exec -it blog-postgres psql -U $PG_USER -d $PG_DATABASE

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "[ERROR] Connection failed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Troubleshooting:" -ForegroundColor Yellow
    Write-Host "1. Check if container is running:" -ForegroundColor Gray
    Write-Host "   docker ps | grep blog-postgres" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "2. Start services if needed:" -ForegroundColor Gray
    Write-Host "   docker-compose up -d" -ForegroundColor Cyan
}

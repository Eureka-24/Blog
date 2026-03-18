# ============================================
# Debug: Check Article Slug Generation
# ============================================
# Usage: .\debug-slug.ps1
# ============================================

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "   Debug Article Slug Generation" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

$PG_USER = "blog"
$PG_DATABASE = "blog"

Write-Host "Step 1: Check recent articles in database..." -ForegroundColor Yellow
Write-Host ""

# Get latest 5 articles
docker exec -it blog-postgres psql -U $PG_USER -d $PG_DATABASE -c @"
SELECT 
  id, 
  title, 
  slug,
  CASE 
    WHEN slug IS NULL OR slug = '' THEN 'MISSING'
    ELSE 'OK'
  END as status,
  create_time
FROM article 
ORDER BY id DESC 
LIMIT 5;
"@

Write-Host ""
Write-Host "Step 2: Count articles with missing slugs..." -ForegroundColor Yellow
Write-Host ""

docker exec -it blog-postgres psql -U $PG_USER -d $PG_DATABASE -c @"
SELECT 
  COUNT(*) as total_articles,
  COUNT(CASE WHEN slug IS NULL OR slug = '' THEN 1 END) as missing_slugs,
  COUNT(CASE WHEN slug LIKE 'post-%' THEN 1 END) as post_prefix_slugs
FROM article;
"@

Write-Host ""
Write-Host "Step 3: Check backend service logs..." -ForegroundColor Yellow
Write-Host ""

Write-Host "Latest web-api logs:" -ForegroundColor Cyan
docker-compose logs --tail=20 web-api 2>$null

Write-Host ""
Write-Host "Latest admin-api logs:" -ForegroundColor Cyan
docker-compose logs --tail=20 admin-api 2>$null

Write-Host ""
Write-Host "=====================================" -ForegroundColor Yellow
Write-Host "   Analysis & Recommendations" -ForegroundColor Yellow
Write-Host "=====================================" -ForegroundColor Yellow
Write-Host ""

# Check if there are articles with missing slugs
$result = docker exec -it blog-postgres psql -U $PG_USER -d $PG_DATABASE -t -c "SELECT COUNT(*) FROM article WHERE slug IS NULL OR slug = '';"
if ([int]$result -gt 0) {
    Write-Host "[ISSUE FOUND] $result articles have missing slugs!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Solution:" -ForegroundColor Yellow
    Write-Host "  Run: .\fix-postgres-slug-docker.ps1" -ForegroundColor Cyan
} else {
    Write-Host "[OK] All articles have slugs" -ForegroundColor Green
}

Write-Host ""
Write-Host "If you just created a new article and slug is still empty:" -ForegroundColor Yellow
Write-Host "  1. Make sure backend code is updated" -ForegroundColor Gray
Write-Host "  2. Rebuild backend: mvn clean install" -ForegroundColor Gray
Write-Host "  3. Restart Docker: docker-compose restart web-api admin-api" -ForegroundColor Gray
Write-Host "  4. Try creating a new test article" -ForegroundColor Gray
Write-Host ""

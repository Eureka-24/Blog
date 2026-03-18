# ============================================
# 博客系统 - PostgreSQL Slug 快速修复脚本
# ============================================
# 用途：自动修复文章中缺失的 slug 字段
# 使用：.\fix-postgres-slug.ps1
# ============================================

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "   PostgreSQL Slug 快速修复工具" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# 配置参数（从 docker-compose.yml 中获取的默认配置）
$PG_HOST = "localhost"
$PG_PORT = "5432"
$PG_USER = "blog"
$PG_DATABASE = "blog"
$PG_PASSWORD = "blog123"  # 默认密码，如果修改过请在此处更改

Write-Host "数据库配置:" -ForegroundColor Yellow
Write-Host "  主机：$PG_HOST:$PG_PORT" -ForegroundColor Gray
Write-Host "  用户：$PG_USER" -ForegroundColor Gray
Write-Host "  数据库：$PG_DATABASE" -ForegroundColor Gray
Write-Host ""

# 检查 psql 是否安装
try {
    $psqlVersion = psql --version
    Write-Host "✓ psql 已安装：$psqlVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ 错误：未找到 psql，请确保 PostgreSQL 已安装" -ForegroundColor Red
    Write-Host "提示：如果使用 Docker，请先连接到容器：" -ForegroundColor Yellow
    Write-Host "  docker exec -it blog-postgres psql -U postgres -d blog_db" -ForegroundColor Gray
    exit 1
}

# SQL 修复脚本内容
$sqlScript = @"
-- Check current data
SELECT '=== Before Fix ===' AS info;
SELECT id, title, slug 
FROM article 
WHERE slug IS NULL OR slug = '' 
LIMIT 10;

-- Count articles need update
SELECT CONCAT('Articles to update: ', COUNT(*)) AS need_update
FROM article 
WHERE slug IS NULL OR slug = '';

-- Execute update (use post-{id} format)
UPDATE article 
SET slug = CONCAT('post-', id),
    update_time = CURRENT_TIMESTAMP
WHERE slug IS NULL OR slug = '';

-- Verify result
SELECT '=== After Fix ===' AS info;
SELECT id, title, slug 
FROM article 
ORDER BY id DESC 
LIMIT 10;

-- Check duplicate slugs
SELECT '=== Check Duplicates ===' AS info;
SELECT slug, COUNT(*) as count
FROM article
GROUP BY slug
HAVING COUNT(*) > 1;

-- Final statistics
SELECT '=== Final Statistics ===' AS info;
SELECT 
  COUNT(*) AS total_articles,
  COUNT(DISTINCT slug) AS unique_slugs,
  COUNT(CASE WHEN slug IS NULL OR slug = '' THEN 1 END) AS null_slugs
FROM article;

-- Complete message
SELECT '✅ Slug fix completed!' AS status;
"@

Write-Host "准备执行 SQL 修复脚本..." -ForegroundColor Cyan
Write-Host ""

# 设置环境变量避免密码提示
$env:PGPASSWORD = $PG_PASSWORD

# 执行 SQL 脚本
try {
    $output = psql -h $PG_HOST -p $PG_PORT -U $PG_USER -d $PG_DATABASE -c "$sqlScript" 2>&1
    Write-Host $output -ForegroundColor White
} catch {
    Write-Host "❌ 执行失败：$_" -ForegroundColor Red
    Write-Host ""
    Write-Host "如果连接失败，可以尝试以下方式：" -ForegroundColor Yellow
    Write-Host "1. 检查 PostgreSQL 是否运行" -ForegroundColor Gray
    Write-Host "2. 检查数据库名称、用户名、密码是否正确" -ForegroundColor Gray
    Write-Host "3. 如果使用 Docker，先启动容器：" -ForegroundColor Gray
    Write-Host "   docker-compose up -d postgres" -ForegroundColor Cyan
    exit 1
}

Write-Host ""
Write-Host "=====================================" -ForegroundColor Green
Write-Host "   ✅ Slug 修复完成！" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host ""

# 清除密码环境变量
Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue

Write-Host "下一步操作:" -ForegroundColor Yellow
Write-Host "1. 重启 Next.js 开发服务器" -ForegroundColor Gray
Write-Host "   cd ..\blog-web" -ForegroundColor Cyan
Write-Host "   rm -r .next" -ForegroundColor Cyan
Write-Host "   npm run dev" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. 访问 http://localhost:3000 测试文章详情" -ForegroundColor Gray
Write-Host ""

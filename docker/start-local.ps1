# 本地开发启动脚本
$ErrorActionPreference = "Stop"
Write-Host "=== 博客系统本地开发启动 ===" -ForegroundColor Green

if (!(Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Error "错误: Docker 未安装"
    exit 1
}

if (!(Get-Command docker-compose -ErrorAction SilentlyContinue)) {
    Write-Error "错误: Docker Compose 未安装"
    exit 1
}

Write-Host "停止旧服务..."
docker-compose -f docker-compose.local.yml down

Write-Host "构建并启动服务..."
docker-compose -f docker-compose.local.yml build
docker-compose -f docker-compose.local.yml up -d

Write-Host ""
Write-Host "=== 服务启动完成 ===" -ForegroundColor Green
Write-Host ""
Write-Host "访问地址：" -ForegroundColor Cyan
Write-Host "  前台 API:   http://localhost:8080/api/articles"
Write-Host "  后台 API:   http://localhost:8081/api/admin/articles"
Write-Host "  PostgreSQL: localhost:5432"
Write-Host "  Redis:      localhost:6379"
Write-Host "  Meilisearch: http://localhost:7700"
Write-Host ""
Write-Host "常用命令：" -ForegroundColor Cyan
Write-Host "  查看日志: docker-compose -f docker-compose.local.yml logs -f"
Write-Host "  停止服务: docker-compose -f docker-compose.local.yml down"
Write-Host ""
Write-Host "等待服务就绪..." -ForegroundColor Yellow
Start-Sleep -Seconds 5
Write-Host ""
Write-Host "提示: 首次启动数据库初始化需要几秒钟" -ForegroundColor Yellow

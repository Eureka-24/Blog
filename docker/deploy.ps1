# 博客系统部署脚本 (PowerShell)

$ErrorActionPreference = "Stop"

Write-Host "=== 博客系统部署脚本 ===" -ForegroundColor Green

# 检查环境
if (!(Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Error "错误: Docker 未安装"
    exit 1
}

if (!(Get-Command docker-compose -ErrorAction SilentlyContinue)) {
    Write-Error "错误: Docker Compose 未安装"
    exit 1
}

# 创建环境文件
if (!(Test-Path .env)) {
    Write-Host "创建环境配置文件..."
    Copy-Item .env.example .env
    Write-Host "请编辑 .env 文件配置数据库密码和其他配置" -ForegroundColor Yellow
}

# 创建 SSL 目录
New-Item -ItemType Directory -Force -Path ssl | Out-Null

# 生成自签名证书（仅用于测试）
if (!(Test-Path ssl/cert.pem)) {
    Write-Host "生成自签名 SSL 证书..."
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 `
        -keyout ssl/key.pem `
        -out ssl/cert.pem `
        -subj "/C=CN/ST=State/L=City/O=Blog/CN=localhost" 2>$null
}

# 构建并启动服务
Write-Host "构建并启动服务..."
docker-compose down
docker-compose build --no-cache
docker-compose up -d

Write-Host ""
Write-Host "=== 部署完成 ===" -ForegroundColor Green
Write-Host "前台 API: http://localhost:8080"
Write-Host "后台 API: http://localhost:8081"
Write-Host "PostgreSQL: localhost:5432"
Write-Host "Redis: localhost:6379"
Write-Host "Meilisearch: http://localhost:7700"
Write-Host ""
Write-Host "查看日志: docker-compose logs -f"

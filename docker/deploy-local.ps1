# ============================================
# Blog System Docker Deployment Script
# ============================================
# 目录结构:
#   docker/
#   ├── deploy-local.ps1          (本脚本)
#   ├── composes/
#   │   ├── infra/                 (基础设施: PostgreSQL, Redis, Meilisearch)
#   │   ├── nginx/                 (Nginx 网关)
#   │   ├── landing/               (导航页 Next.js SSR)
#   │   └── blog/                  (博客服务: API + 前台)
#   └── uploads/                   (上传文件目录)
#
# 启动顺序: infra -> nginx -> landing -> blog
#
# Usage:
#   .\deploy-local.ps1              # 部署所有服务
#   .\deploy-local.ps1 -InfraOnly   # 仅部署基础设施
#   .\deploy-local.ps1 -BlogOnly    # 仅部署博客服务 (需要 infra 已运行)
#   .\deploy-local.ps1 -Stop        # 停止所有服务
#   .\deploy-local.ps1 -Rebuild     # 强制重新构建镜像
#   .\deploy-local.ps1 -BuildFirst  # 先在本地构建前端/后端
#   .\deploy-local.ps1 -SkipBuild   # 跳过 Docker 构建 (使用现有镜像)
# ============================================

param(
    [switch]$InfraOnly,
    [switch]$BlogOnly,
    [switch]$Stop,
    [switch]$Rebuild,
    [switch]$BuildFirst,
    [switch]$SkipBuild
)

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir
$ComposesDir = Join-Path $ScriptDir "composes"

# Compose 文件路径
$InfraCompose = Join-Path $ComposesDir "infra\docker-compose.yml"
$NginxCompose = Join-Path $ComposesDir "nginx\docker-compose.yml"
$LandingCompose = Join-Path $ComposesDir "landing\docker-compose.yml"
$BlogCompose = Join-Path $ComposesDir "blog\docker-compose.yml"

function Write-Header {
    param([string]$Title)
    Write-Host ""
    Write-Host "============================================" -ForegroundColor Cyan
    Write-Host " $Title" -ForegroundColor Cyan
    Write-Host "============================================" -ForegroundColor Cyan
}

function Wait-Healthy {
    param([string]$ContainerName, [int]$TimeoutSeconds = 60)
    
    Write-Host "Waiting for $ContainerName to be healthy..." -NoNewline
    $elapsed = 0
    
    while ($elapsed -lt $TimeoutSeconds) {
        $status = docker inspect --format='{{.State.Health.Status}}' $ContainerName 2>$null
        if ($status -eq "healthy") {
            Write-Host " OK" -ForegroundColor Green
            return $true
        }
        Write-Host "." -NoNewline
        Start-Sleep -Seconds 2
        $elapsed += 2
    }
    
    Write-Host " TIMEOUT" -ForegroundColor Red
    return $false
}

function Test-ContainerRunning {
    param([string]$ContainerName)
    $status = docker inspect --format='{{.State.Status}}' $ContainerName 2>$null
    return $status -eq "running"
}

function Invoke-BuildAdminStatic {
    Write-Header "Building Admin Frontend (Vite SPA)"
    
    $adminDir = Join-Path $ProjectRoot "blog-admin"
    
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    Push-Location $adminDir
    try {
        npm ci
        if ($LASTEXITCODE -ne 0) { throw "npm ci failed" }
        
        Write-Host "Building blog-admin for Docker deployment..." -ForegroundColor Yellow
        # 设置 Docker 部署环境变量（通过 nginx 代理访问 API）
        # VITE_API_URL 已包含完整路径前缀，前端路径不再需要 /admin 前缀
        $env:VITE_API_URL = "/blog/api/admin"
        $env:VITE_WEB_API_URL = "/blog/api"
        $env:VITE_WEB_URL = "/blog"
        # Vite base 配置 - 确保资源路径正确
        $env:BASE_URL = "/blog/admin/"
        
        npm run build -- --base=/blog/admin/
        if ($LASTEXITCODE -ne 0) { throw "blog-admin build failed" }
        
        Write-Host "blog-admin build completed -> $adminDir\dist" -ForegroundColor Green
    } finally {
        Pop-Location
    }
}

# 停止所有服务
if ($Stop) {
    Write-Header "Stopping All Services"
    
    Write-Host "Stopping blog services..." -ForegroundColor Yellow
    docker-compose -f $BlogCompose down 2>$null
    
    Write-Host "Stopping landing services..." -ForegroundColor Yellow
    docker-compose -f $LandingCompose down 2>$null
    
    Write-Host "Stopping nginx..." -ForegroundColor Yellow
    docker-compose -f $NginxCompose down 2>$null
    
    Write-Host "Stopping infrastructure services..." -ForegroundColor Yellow
    docker-compose -f $InfraCompose down 2>$null
    
    Write-Host "All services stopped." -ForegroundColor Green
    exit 0
}

# 检查 Docker 是否运行
Write-Header "Pre-flight Checks"
try {
    docker info | Out-Null
    Write-Host "Docker is running" -ForegroundColor Green
} catch {
    Write-Host "Docker is not running. Please start Docker Desktop." -ForegroundColor Red
    exit 1
}

# 验证 compose 文件存在
$composeFiles = @($InfraCompose, $NginxCompose, $LandingCompose, $BlogCompose)
foreach ($file in $composeFiles) {
    if (-not (Test-Path $file)) {
        Write-Host "Compose file not found: $file" -ForegroundColor Red
        exit 1
    }
}
Write-Host "All compose files found" -ForegroundColor Green

# ============================================
# 1. 部署基础设施 (PostgreSQL, Redis, Meilisearch)
# ============================================
if (-not $BlogOnly) {
    Write-Header "[1/4] Deploying Infrastructure Services"
    
    $buildArg = if ($Rebuild) { "--build" } else { "" }
    
    Write-Host "Starting PostgreSQL, Redis, Meilisearch..." -ForegroundColor Yellow
    Invoke-Expression "docker-compose -f `"$InfraCompose`" up -d $buildArg"
    
    if (-not (Wait-Healthy "infra-postgres" -TimeoutSeconds 90)) {
        Write-Host "PostgreSQL failed to start" -ForegroundColor Red
        exit 1
    }
    
    if (-not (Wait-Healthy "infra-redis" -TimeoutSeconds 30)) {
        Write-Host "Redis failed to start" -ForegroundColor Red
        exit 1
    }
    
    Start-Sleep -Seconds 3  # Meilisearch needs extra time
    
    Write-Host ""
    Write-Host "Infrastructure services are ready:" -ForegroundColor Green
    Write-Host "  PostgreSQL:  localhost:5432" -ForegroundColor White
    Write-Host "  Redis:       localhost:6379" -ForegroundColor White
    Write-Host "  Meilisearch: localhost:7700" -ForegroundColor White
    
    if ($InfraOnly) {
        Write-Host ""
        Write-Host "Infrastructure only mode. Other services not deployed." -ForegroundColor Yellow
        exit 0
    }
}

# ============================================
# 2. 构建 Admin 静态文件 (Vite SPA)
# ============================================
if (-not $InfraOnly) {
    # 检查 blog-admin/dist 是否存在
    $adminDist = Join-Path $ProjectRoot "blog-admin\dist"
    if (-not (Test-Path $adminDist) -or $BuildFirst) {
        Invoke-BuildAdminStatic
    } else {
        Write-Header "[2/4] Admin Frontend (already built, skip)"
        Write-Host "Found: $adminDist" -ForegroundColor Gray
    }
}

# ============================================
# 3. 部署 Nginx 网关
# ============================================
if (-not $InfraOnly -and -not $BlogOnly) {
    Write-Header "[3/4] Deploying Nginx Gateway"
    
    $buildArg = if ($Rebuild) { "--build" } else { "" }
    
    Write-Host "Starting Nginx..." -ForegroundColor Yellow
    Invoke-Expression "docker-compose -f `"$NginxCompose`" up -d $buildArg"
    
    Start-Sleep -Seconds 3
    
    if (-not (Test-ContainerRunning "nginx-gateway")) {
        Write-Host "Nginx failed to start" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "Nginx gateway is ready" -ForegroundColor Green
}

# ============================================
# 4. 部署 Landing 导航页
# ============================================
if (-not $InfraOnly -and -not $BlogOnly) {
    Write-Header "[4/4] Deploying Landing Page"
    
    $buildArg = ""
    if ($Rebuild) { $buildArg = "--build" }
    if ($SkipBuild) { $buildArg = "--no-build" }
    
    Write-Host "Starting Landing (Next.js SSR)..." -ForegroundColor Yellow
    if (-not $BuildFirst -and -not $SkipBuild) {
        Write-Host "Building inside Docker (first run may take a few minutes)..." -ForegroundColor Gray
    }
    
    Invoke-Expression "docker-compose -f `"$LandingCompose`" up -d $buildArg"
    
    Start-Sleep -Seconds 5
    
    if (-not (Test-ContainerRunning "blog-landing")) {
        Write-Host "Landing failed to start" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "Landing page is ready" -ForegroundColor Green
}

# ============================================
# 5. 部署 Blog 服务 (API + 前台)
# ============================================
if (-not $InfraOnly) {
    Write-Header "Deploying Blog Services"
    
    # 验证基础设施是否运行
    if (-not (Test-ContainerRunning "infra-postgres")) {
        Write-Host "Infrastructure is not running. Please run without -BlogOnly first." -ForegroundColor Red
        exit 1
    }
    
    $buildArg = ""
    if ($Rebuild) { $buildArg = "--build" }
    if ($SkipBuild) { $buildArg = "--no-build" }
    
    Write-Host "Starting blog services (Web API, Admin API, Blog Web)..." -ForegroundColor Yellow
    if (-not $BuildFirst -and -not $SkipBuild) {
        Write-Host "Building inside Docker (first run may take a few minutes)..." -ForegroundColor Gray
    }
    
    Invoke-Expression "docker-compose -f `"$BlogCompose`" up -d $buildArg"
    
    Write-Host ""
    Write-Host "Blog services are starting..." -ForegroundColor Green
    
    # 等待 API 服务启动
    Start-Sleep -Seconds 10
}

# ============================================
# 最终状态
# ============================================
Write-Header "Deployment Complete"
Write-Host ""
Write-Host "Access points:" -ForegroundColor Cyan
Write-Host "  Landing Page:  http://localhost" -ForegroundColor White
Write-Host "  Blog Web:      http://localhost/blog" -ForegroundColor White
Write-Host "  Admin Panel:   http://localhost/blog/admin" -ForegroundColor White
Write-Host "  API (Web):     http://localhost/blog/api" -ForegroundColor White
Write-Host "  API (Admin):   http://localhost/blog/api/admin" -ForegroundColor White
Write-Host ""
Write-Host "Default admin credentials:" -ForegroundColor Yellow
Write-Host "  Username: admin" -ForegroundColor White
Write-Host "  Password: admin123" -ForegroundColor White
Write-Host ""
Write-Host "Useful commands:" -ForegroundColor Cyan
Write-Host "  View logs:     docker-compose -f composes/blog/docker-compose.yml logs -f" -ForegroundColor Gray
Write-Host "  Stop all:      .\deploy-local.ps1 -Stop" -ForegroundColor Gray
Write-Host "  Rebuild:       .\deploy-local.ps1 -Rebuild" -ForegroundColor Gray
Write-Host "  Pre-build:     .\deploy-local.ps1 -BuildFirst" -ForegroundColor Gray
Write-Host "  Skip rebuild:  .\deploy-local.ps1 -SkipBuild" -ForegroundColor Gray

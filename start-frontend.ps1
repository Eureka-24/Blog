# ============================================
# 博客系统前端快速启动脚本 (PowerShell)
# ============================================

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "  博客系统前端启动脚本" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# 检查 Node.js 是否安装
Write-Host "[1/4] 检查 Node.js 环境..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js 已安装：$nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ 错误：未找到 Node.js，请先安装 Node.js" -ForegroundColor Red
    exit 1
}

# 检查后端服务是否运行
Write-Host ""
Write-Host "[2/4] 检查后端 Docker 容器..." -ForegroundColor Yellow
$runningContainers = docker ps --filter "name=blog-" --format "{{.Names}}"
if ($runningContainers -match "blog-web-api") {
    Write-Host "✓ Web API 容器运行中" -ForegroundColor Green
} else {
    Write-Host "⚠ Web API 容器未运行，前端可能无法获取数据" -ForegroundColor Yellow
}

if ($runningContainers -match "blog-admin-api") {
    Write-Host "✓ Admin API 容器运行中" -ForegroundColor Green
} else {
    Write-Host "⚠ Admin API 容器未运行，前端可能无法获取数据" -ForegroundColor Yellow
}

# 启动 Admin 前端
Write-Host ""
Write-Host "[3/4] 启动后台管理前端 (blog-admin)..." -ForegroundColor Yellow
Set-Location $PSScriptRoot\blog-admin

if (-not (Test-Path "node_modules")) {
    Write-Host "首次运行，正在安装依赖..." -ForegroundColor Yellow
    npm install --legacy-peer-deps
}

Write-Host "正在启动 Vite 开发服务器..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev"
Write-Host "✓ Admin 前端将在 http://localhost:5173 启动" -ForegroundColor Green

# 等待 2 秒
Start-Sleep -Seconds 2

# 启动 Web 前端
Write-Host ""
Write-Host "[4/4] 启动前台网站 (blog-web)..." -ForegroundColor Yellow
Set-Location $PSScriptRoot\blog-web

if (-not (Test-Path "node_modules")) {
    Write-Host "首次运行，正在安装依赖..." -ForegroundColor Yellow
    npm install --legacy-peer-deps
}

Write-Host "正在启动 Next.js 开发服务器..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev"
Write-Host "✓ Web 前端将在 http://localhost:3000 启动" -ForegroundColor Green

# 完成
Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "  启动完成！" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "访问地址:" -ForegroundColor White
Write-Host "  • 后台管理：http://localhost:5173" -ForegroundColor Blue
Write-Host "  • 前台网站：http://localhost:3000" -ForegroundColor Blue
Write-Host ""
Write-Host "提示:" -ForegroundColor Yellow
Write-Host "  • 每个前端都会在独立的 PowerShell 窗口运行" -ForegroundColor Gray
Write-Host "  • 按 Ctrl+C 可以停止开发服务器" -ForegroundColor Gray
Write-Host "  • 查看控制台输出了解详细信息" -ForegroundColor Gray
Write-Host ""

# 博客系统启动脚本
# 用于同时启动前台、后台和后端服务

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "     博客系统 - 全服务启动脚本" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# 检查 Node.js 是否安装
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js 已安装：$nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ 错误：未找到 Node.js，请先安装 Node.js" -ForegroundColor Red
    exit 1
}

# 检查 Java 是否安装
try {
    $javaVersion = java --version
    Write-Host "✓ Java 已安装" -ForegroundColor Green
} catch {
    Write-Host "✗ 错误：未找到 Java，请先安装 Java" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "准备启动以下服务：" -ForegroundColor Yellow
Write-Host "  1. 前台 Web (Next.js) - http://localhost:3000" -ForegroundColor Cyan
Write-Host "  2. 管理后台 (Vite) - http://localhost:5173" -ForegroundColor Cyan
Write-Host "  3. 后端 API (Spring Boot) - http://localhost:8080, 8081" -ForegroundColor Cyan
Write-Host ""

# 启动前台 Web
Write-Host "正在启动前台 Web 服务..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\blog-web'; npm run dev"
Start-Sleep -Seconds 2

# 启动管理后台
Write-Host "正在启动管理后台服务..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\blog-admin'; npm run dev"
Start-Sleep -Seconds 2

# 启动后端（通过 Docker 或 Maven）
Write-Host ""
Write-Host "提示：后端服务请通过 Docker 或 Maven 启动" -ForegroundColor Yellow
Write-Host "  - Docker 启动：运行 docker-compose up" -ForegroundColor Gray
Write-Host "  - Maven 启动：运行 mvn spring-boot:run" -ForegroundColor Gray
Write-Host ""

Write-Host "=====================================" -ForegroundColor Green
Write-Host "     所有前端服务已启动！" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host ""
Write-Host "访问地址：" -ForegroundColor Yellow
Write-Host "  📖 前台博客：http://localhost:3000" -ForegroundColor Blue
Write-Host "  🔧 管理后台：http://localhost:5173" -ForegroundColor Blue
Write-Host ""
Write-Host "按 Ctrl+C 停止查看日志" -ForegroundColor Gray

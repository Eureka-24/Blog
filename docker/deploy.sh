#!/bin/bash

# 博客系统部署脚本

set -e

echo "=== 博客系统部署脚本 ==="

# 检查环境
if ! command -v docker &> /dev/null; then
    echo "错误: Docker 未安装"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "错误: Docker Compose 未安装"
    exit 1
fi

# 创建环境文件
if [ ! -f .env ]; then
    echo "创建环境配置文件..."
    cp .env.example .env
    echo "请编辑 .env 文件配置数据库密码和其他配置"
fi

# 创建 SSL 目录
mkdir -p ssl

# 生成自签名证书（仅用于测试）
if [ ! -f ssl/cert.pem ]; then
    echo "生成自签名 SSL 证书..."
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout ssl/key.pem \
        -out ssl/cert.pem \
        -subj "/C=CN/ST=State/L=City/O=Blog/CN=localhost"
fi

# 构建并启动服务
echo "构建并启动服务..."
docker-compose down
docker-compose build
docker-compose up -d

echo ""
echo "=== 部署完成 ==="
echo "前台 API: http://localhost:8080"
echo "后台 API: http://localhost:8081"
echo "PostgreSQL: localhost:5432"
echo "Redis: localhost:6379"
echo "Meilisearch: http://localhost:7700"
echo ""
echo "查看日志: docker-compose logs -f"

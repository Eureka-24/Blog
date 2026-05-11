---
title: Docker常见问题
date: 2025-05-09 18:57:30
categories:
  - 杂项
tags:
  - Docker
---

# Agent开发学习记录

## Docker修改安装目录

```cmd
start /w "" "Docker Desktop Installer.exe" install -accept-license --installation-dir="D:\Tools\Docker\DockerDesktop" --wsl-default-data-root="D:\Tools\Docker\data" --windows-containers-default-data-root="D:\\Tools\\Docker"
```

| 命令片段 | 含义与作用 |
| :--- | :--- |
| `start /w ""` | 启动并等待。<br>告诉系统运行后面的程序，并且等待它安装完成后再返回命令行提示符（防止窗口闪退）。 |
| `"Docker Desktop Installer.exe"` | 安装文件名。<br>这就是你下载的那个 Docker 安装包程序。 |
| `install` | 执行安装。<br>告诉程序不要解压或只做其他操作，直接开始安装流程。 |
| `-accept-license` | 自动同意协议。<br>跳过“是否接受许可条款”的勾选步骤，自动确认。 |
| `--installation-dir="..."` | 指定程序安装位置。<br>这里指定了 `D:\Program Files\Docker`，意味着 Docker 的软件本体（运行所需的执行文件）会安装在这里。 |
| `--wsl-default-data-root="..."` | 指定 WSL2 数据存储位置（最关键）<br>这里指定了 `D:\Program Files\Docker\data`。Docker 运行后产生的镜像、容器、数据卷（通常占用几十 GB 空间的大文件 `ext4.vhdx`）都会存放在这里，从而彻底释放 C 盘空间。 |
| `--windows-containers-default-data-root="..."` | 指定 Windows 容器数据位置。<br>如果你以后使用 Windows 容器（较少用），其数据也会存在 D 盘。 |


## Docker代理配置

1. `pull`代理直接在`DockerDesktop`的`Docker Engine`配置
```json
"proxies": {
    "default": {
      "httpProxy": "http://127.0.0.1:7890",
      "httpsProxy": "http://127.0.0.1:7890",
      "noProxy": "localhost,127.0.0.1"
    }
  }
```
2. 拉取基础python镜像失败，直接拉取，Dockerfile构建时会默认使用本地存在的镜像
```docker
docker pull library/python:3.10-slim
```

## Dockerfile的镜像源配置
```dockerfile
# Build stage
FROM python:3.10-slim as builder

WORKDIR /app
# ==========================================
# 1. 配置国内 apt 源 (Debian bullseye)
# ==========================================
RUN echo 'deb http://mirrors.aliyun.com/debian/ bullseye main non-free contrib' > /etc/apt/sources.list && \
    echo 'deb http://mirrors.aliyun.com/debian/ bullseye-updates main non-free contrib' >> /etc/apt/sources.list && \
    echo 'deb http://mirrors.aliyun.com/debian-security/ bullseye-security main non-free contrib' >> /etc/apt/sources.list

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

# ==========================================
# 2. 配置国内 pip 源
# ==========================================
RUN pip install --no-cache-dir -i https://pypi.tuna.tsinghua.edu.cn/simple --prefix=/install -r requirements.txt

# ==========================================
# Run stage
# ==========================================
FROM python:3.10-slim

WORKDIR /app

# ==========================================
# 3. 运行阶段同样需要配置 apt 源
# ==========================================
RUN echo 'deb http://mirrors.aliyun.com/debian/ bullseye main non-free contrib' > /etc/apt/sources.list && \
    echo 'deb http://mirrors.aliyun.com/debian/ bullseye-updates main non-free contrib' >> /etc/apt/sources.list && \
    echo 'deb http://mirrors.aliyun.com/debian-security/ bullseye-security main non-free contrib' >> /etc/apt/sources.list

# Install runtime dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    libpq5 \
    && rm -rf /var/lib/apt/lists/*
```
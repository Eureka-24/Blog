---
title: WSL2网络代理配置
date: 2026-05-13 12:55:07
categories:
  - 杂项
tags:
  - WSL
---
# WSL2网络代理配置

## NAT 模式

### 环境

| 项目              | 配置                              |
| ----------------- | --------------------------------- |
| 环境              | Windows 11 + WSL2                 |
| 网络模式          | NAT                               |
| 宿主机虚拟网卡 IP | 192.168.1.27 （动态改变，不重要） |
| 代理端口          | 7890                              |

### 操作

**STEP1**

在代理软件中开启 **Allow LAN（允许局域网连接）**。

**STEP2**

使用**管理员身份**运行 PowerShell，开放防火墙

```powershell
New-NetFirewallRule -DisplayName "Allow WSL Proxy" -Direction Inbound -Action Allow -Protocol TCP -LocalPort 7890
```

**STEP3**

WSL2 启动脚本`~/update_proxy.sh`

```sh
#!/bin/bash
# 自动获取 Windows 主机的最新 IP 地址
HOST_IP="host.docker.internal"
CLASH_PORT="7890"  # 如果你的Clash端口不是7890，请在这里修改

# 自动配置 Git 的 http 和 https 代理
git config --global http.proxy http://${HOST_IP}:${CLASH_PORT}
git config --global https.proxy http://${HOST_IP}:${CLASH_PORT}

# 可选：同时设置终端的环境变量代理（方便 apt, curl, wget 等命令使用）
export http_proxy=http://${HOST_IP}:${CLASH_PORT}
export https_proxy=http://${HOST_IP}:${CLASH_PORT}

echo "✅ WSL2 代理已自动更新，当前 Windows 主机 IP 为：${HOST_IP}"
```

加入启动脚本，将以下两行加入`~/.bashrc`当中

```sh
# 每次启动终端时自动更新代理配置
~/update_proxy.sh
```

激活配置

```bash
source ~/.bashrc
```

## 镜像网络模式

同NAT 模式，但由于开启了镜像网络模式，wsl内访问`127.0.0.1`就相当于访问主机电脑。

对WLS2启动脚本的`HOST_IP`进行修改

```sh
#!/bin/bash
# 自动获取 Windows 主机的最新 IP 地址
HOST_IP="127.0.0.1" 
CLASH_PORT="7890"  # 如果你的Clash端口不是7890，请在这里修改

# 自动配置 Git 的 http 和 https 代理
git config --global http.proxy http://${HOST_IP}:${CLASH_PORT}
git config --global https.proxy http://${HOST_IP}:${CLASH_PORT}

# 可选：同时设置终端的环境变量代理（方便 apt, curl, wget 等命令使用）
export http_proxy=http://${HOST_IP}:${CLASH_PORT}
export https_proxy=http://${HOST_IP}:${CLASH_PORT}

echo "✅ WSL2 代理已自动更新，当前 Windows 主机 IP 为：${HOST_IP}"
```


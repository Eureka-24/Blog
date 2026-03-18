# 🔧 Docker 镜像构建修复指南

## ❌ 之前的问题

### 错误的流程
```powershell
# 1. 编译 Java 代码
mvn clean install  ✓ 生成新的 jar

# 2. 重启容器
docker-compose restart web-api  ❌ 只是重启，不是重建！
```

### 为什么不起作用？

```
本地编译                    Docker 容器
┌─────────────┐            ┌──────────────┐
│ blog-api/   │            │ 旧镜像层      │
│ target/     │            │ ┌──────────┐ │
│  new.jar ←新 │            │ │ old.jar │ │ ← 旧代码
└─────────────┘            │ └──────────┘ │
                           └──────────────┘
        ↑                        ↑
        │                        │
    新编译的代码              容器内仍是旧代码
    
docker-compose restart 
        ↓
   只是重启容器，不更新镜像！
```

---

## ✅ 正确的解决方案

### 方案一：使用 docker-compose build（推荐）⭐

```powershell
# 1. 编译 Java 代码
cd blog-api
mvn clean install -DskipTests

# 2. 重新构建 Docker 镜像
cd ../docker
docker-compose build web-api admin-api

# 3. 启动新镜像
docker-compose up -d web-api admin-api
```

### 工作流程

```
本地编译                    Docker 构建
┌─────────────┐            ┌──────────────┐
│ blog-api/   │   Maven    │ 新镜像层      │
│ target/     │ ─────────→ │ ┌──────────┐ │
│  new.jar ←新 │  复制     │ │ new.jar │ │ ← 新代码
└─────────────┘            │ └──────────┘ │
                           └──────────────┘
                                  ↑
                                  │
                          docker-compose build
                                  ↓
                          docker-compose up
                                  ↓
                          运行新容器 ✓
```

---

## 📊 命令对比

| 命令 | 作用 | 是否更新代码 |
|------|------|-------------|
| `docker-compose restart` | 重启现有容器 | ❌ 否 |
| `docker-compose up -d` | 启动服务（如果镜像已存在则直接使用） | ❌ 否 |
| `docker-compose build` | **重新构建镜像** | ✅ 是 |
| `docker-compose up -d --build` | 构建并启动 | ✅ 是 |
| `docker-compose down && up -d` | 完全重启 | ❌ 否（除非先 build） |

---

## 🎯 已修复的脚本

### quick-fix-slug.ps1

```powershell
# Step 1: 编译 Java 代码
mvn clean install -DskipTests  ✓

# Step 2: 重新构建 Docker 镜像
docker-compose build web-api admin-api  ✓

# Step 3: 启动新镜像
docker-compose up -d web-api admin-api  ✓

# Step 4: 检查状态
docker-compose ps  ✓
```

---

## 🚀 使用方法

### 快速修复

```powershell
# PowerShell
.\docker\quick-fix-slug.ps1
```

这个脚本会：
1. ✅ 编译最新的 Java 代码
2. ✅ 重新构建 Docker 镜像（包含新代码）
3. ✅ 启动使用新镜像的容器
4. ✅ 验证服务状态

---

## 🔍 验证代码已更新

### 方法 1: 查看容器内的文件时间戳

```powershell
# 进入容器
docker exec -it blog-web-api bash

# 查看 jar 文件时间戳
ls -lh /app/blog-web-api.jar

# 退出
exit
```

### 方法 2: 查看应用日志

```powershell
# 查看启动日志
docker-compose logs web-api | Select-String "Started"

# 应该看到类似：
# Started WebApiApplication in 5.123 seconds
```

### 方法 3: 测试新功能

```powershell
# 1. 创建一篇新的中文文章
# 访问：http://localhost:5173

# 2. 检查 slug 是否生成
.\debug-slug.ps1

# 3. 应该看到最新文章有 slug
# post-1710234567890-123
```

---

## 💡 其他有用的命令

### 强制重新构建（无缓存）

```powershell
# 不使用缓存，完全重新构建
docker-compose build --no-cache web-api admin-api
```

### 一次性构建并启动

```powershell
# 构建并启动所有服务
docker-compose up -d --build
```

### 查看镜像信息

```powershell
# 查看所有镜像
docker images

# 查看特定镜像
docker images | findstr blog
```

### 清理旧镜像

```powershell
# 删除悬空镜像
docker image prune

# 删除所有未使用的镜像
docker image prune -a
```

---

## ⚠️ 注意事项

### 1. 构建时间

```
首次构建：~2-3 分钟（需要下载依赖）
后续构建：~30 秒（使用缓存）
```

### 2. 磁盘空间

每次构建都会创建新镜像，定期清理：

```powershell
# 查看磁盘使用
docker system df

# 清理
docker system prune
```

### 3. 开发环境优化

如果你频繁修改代码，可以考虑：

**方式 A: 使用卷挂载（实时重载）**

修改 `docker-compose.yml`:
```yaml
web-api:
  volumes:
    - ../blog-api/target:/app/target
```

**方式 B: 使用 JRebel（热部署）**

需要配置 JRebel 插件。

---

## 📝 总结

### 正确的流程

```bash
# 1. 编译代码
mvn clean install

# 2. 构建镜像
docker-compose build

# 3. 启动服务
docker-compose up -d

# 4. 验证
docker-compose ps
docker-compose logs
```

### 关键要点

- ✅ **始终使用 `docker-compose build`** 来更新代码
- ✅ `restart` 不会更新代码
- ✅ 构建可能需要几分钟，耐心等待
- ✅ 定期清理旧镜像节省空间

---

**现在执行 `.\docker\quick-fix-slug.ps1` 来正确修复 slug 问题！** 🎉

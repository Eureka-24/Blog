# 🔐 后端数据库密码配置文件位置

## 📂 密码配置文件清单

### 1. Docker 环境变量文件 ⭐ **最关键**

**文件位置**: `d:\Blog\main\blog-system\docker\.env`

```yaml
# 第 2 行
DB_PASSWORD=your_secure_password
```

**当前状态**: ❌ **这是问题所在！**
- 你设置的是：`your_secure_password`
- 但数据库实际密码是：`blog123`（默认值）

---

### 2. Docker Compose 配置文件

**文件位置**: `d:\Blog\main\blog-system\docker\docker-compose.yml`

```yaml
# 第 11 行 - PostgreSQL 配置
POSTGRES_PASSWORD: ${DB_PASSWORD:-blog123}
                                    ↑
                              默认值：blog123

# 第 66 行 - Web API 配置
DB_PASS: ${DB_PASSWORD:-blog123}

# 第 91 行 - Admin API 配置  
DB_PASS: ${DB_PASSWORD:-blog123}
```

**工作原理**:
- `${DB_PASSWORD:-blog123}` 表示：如果 `.env` 文件中没有 `DB_PASSWORD`，则使用默认值 `blog123`
- 因为你的 `.env` 文件有 `DB_PASSWORD=your_secure_password`，所以 Docker 使用了这个错误的密码

---

### 3. Spring Boot 配置文件

**文件位置**: 
- `d:\Blog\main\blog-system\blog-api\blog-web-api\src\main\resources\application.yml` (第 11 行)
- `d:\Blog\main\blog-system\blog-api\blog-admin-api\src\main\resources\application.yml` (第 11 行)

```yaml
spring:
  datasource:
    password: ${DB_PASS:blog}
                       ↑
                 默认值：blog
```

**注意**: 这里的默认值是 `blog`，但会被 Docker 环境变量覆盖为 `blog123`

---

## 🔍 问题根源分析

### 密码不匹配的原因

```
┌─────────────────────────────────────┐
│ 1. 数据库初始化时使用的密码          │
│    POSTGRES_PASSWORD: blog123       │ ← 默认值
│    (因为当时.env 还没生效)           │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│ 2. .env 文件中的密码                  │
│    DB_PASSWORD=your_secure_password │ ← 你设置的
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│ 3. 后端容器尝试连接的密码            │
│    从.env 读取：your_secure_password │ ← 错误！
└─────────────────────────────────────┘
              ↓
         ❌ 认证失败！
```

---

## ✅ 解决方案

### 方案一：修复.env 文件（推荐）⭐

**步骤 1**: 编辑 `.env` 文件

```powershell
notepad d:\Blog\main\blog-system\docker\.env
```

**步骤 2**: 修改第 2 行

```yaml
# 修改前（错误）
DB_PASSWORD=your_secure_password

# 修改后（正确）
DB_PASSWORD=blog123
```

**步骤 3**: 重启服务

```powershell
cd d:\Blog\main\blog-system\docker
docker-compose restart web-api admin-api
```

等待 10 秒后验证：

```powershell
.\check-backend.ps1
```

---

### 方案二：重置数据库密码

如果你想使用自己的密码：

**步骤 1**: 进入数据库

```powershell
docker exec -it blog-postgres psql -U postgres -d blog
```

**步骤 2**: 修改密码

```sql
ALTER USER blog WITH PASSWORD 'your_secure_password';
\q
```

**步骤 3**: 确保 `.env` 文件密码一致

```yaml
# .env 文件
DB_PASSWORD=your_secure_password  # 必须与上面设置的相同
```

**步骤 4**: 重启服务

```powershell
docker-compose restart web-api admin-api
```

---

## 📊 密码配置对比表

| 配置文件 | 当前位置 | 密码值 | 状态 |
|---------|---------|--------|------|
| `.env` | 第 2 行 | `your_secure_password` | ❌ 错误 |
| `docker-compose.yml` (postgres) | 第 11 行 | 从 `.env` 读取 → `your_secure_password` | ❌ 不匹配 |
| `docker-compose.yml` (web-api) | 第 66 行 | 从 `.env` 读取 → `your_secure_password` | ❌ 不匹配 |
| 数据库实际密码 | - | `blog123` (初始化时的默认值) | ✅ 正确 |
| `application.yml` | 第 11 行 | 环境变量覆盖 → `blog123` | ✅ 正确 |

---

## 🎯 快速修复命令

```powershell
# 1. 自动修复（推荐）
cd d:\Blog\main\blog-system\docker
.\fix-db-password.ps1

# 选择选项 1，然后按 Enter 使用默认密码 blog123

# 2. 手动修复
notepad .env
# 修改第 2 行为：DB_PASSWORD=blog123
# 保存并关闭

# 3. 重启服务
docker-compose restart web-api admin-api

# 4. 验证
.\check-backend.ps1
```

---

## 🔑 密码优先级说明

### Docker 环境变量优先级

```
1. .env 文件中的值 (最高优先级)
   ↓
2. docker-compose.yml 中的 ${VAR:-default}
   ↓
3. 默认值 (最低优先级)
```

### 在你的项目中

```
.env: DB_PASSWORD=your_secure_password  ← 使用这个
     ↓
docker-compose.yml: ${DB_PASSWORD:-blog123}
     ↓
实际使用：your_secure_password ❌ (与数据库不匹配)
```

---

## 📝 总结

**问题文件**: `d:\Blog\main\blog-system\docker\.env` (第 2 行)

**错误配置**: `DB_PASSWORD=your_secure_password`

**正确配置**: `DB_PASSWORD=blog123`

**影响范围**:
- ❌ Web API 无法连接数据库 → 500 错误
- ❌ Admin API 无法连接数据库 → 500 错误
- ❌ 所有文章数据无法访问

**修复时间**: 约 2 分钟

---

**立即修复**: 执行 `.\docker\fix-db-password.ps1` 选择选项 1！🎉

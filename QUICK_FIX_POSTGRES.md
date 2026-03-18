# 🚀 PostgreSQL Slug 快速修复（一键执行）

## 📊 当前数据库配置

根据项目分析，你的 Docker 数据库配置如下：

```yaml
数据库类型：PostgreSQL 15
数据库名称：blog
用户名：blog
密码：blog123
主机：localhost
端口：5432
```

---

## ✅ 方案一：PowerShell 一键修复（最简单）⭐

### 步骤 1: 打开 PowerShell

在 `d:\Blog\main\blog-system\docker` 目录下打开 PowerShell。

### 步骤 2: 执行修复脚本

```powershell
.\fix-postgres-slug.ps1
```

**如果出现权限错误**，使用：
```powershell
powershell -ExecutionPolicy Bypass -File .\fix-postgres-slug.ps1
```

### 步骤 3: 查看输出

脚本会自动显示：
- ✅ 修复前的数据预览
- ✅ 需要更新的文章数量
- ✅ 执行结果
- ✅ 修复后的数据验证
- ✅ 是否有重复 slug 检查

### 步骤 4: 重启 Next.js

```powershell
# 停止当前运行的 Next.js（按 Ctrl+C）
cd ..\blog-web
rm -r .next
npm run dev
```

### 步骤 5: 测试

访问 http://localhost:3000，点击文章应该能正常打开了！

---

## 🔧 方案二：手动执行 SQL

如果脚本执行失败，可以手动连接数据库执行 SQL。

### 方式 A: 使用 psql 命令行

```powershell
# 连接到数据库
psql -h localhost -p 5432 -U blog -d blog

# 输入密码：blog123

# 然后执行以下 SQL：
UPDATE article 
SET slug = CONCAT('post-', id), 
    update_time = CURRENT_TIMESTAMP 
WHERE slug IS NULL OR slug = '';

# 验证
SELECT id, title, slug FROM article ORDER BY id DESC LIMIT 10;

# 退出
\q
```

### 方式 B: 使用 Docker exec

```powershell
# 直接在容器中执行
docker exec -it blog-postgres psql -U blog -d blog -c @"
UPDATE article 
SET slug = CONCAT('post-', id), 
    update_time = CURRENT_TIMESTAMP 
WHERE slug IS NULL OR slug = '';

SELECT id, title, slug FROM article ORDER BY id DESC LIMIT 10;
"@
```

### 方式 C: 使用 pgAdmin

1. 打开 pgAdmin
2. 添加服务器：
   - Host: `localhost`
   - Port: `5432`
   - Database: `blog`
   - Username: `blog`
   - Password: `blog123`
3. 打开 Query Tool
4. 执行 SQL：
```sql
UPDATE article 
SET slug = CONCAT('post-', id), 
    update_time = CURRENT_TIMESTAMP 
WHERE slug IS NULL OR slug = '';
```

---

## 🐛 常见问题

### Q1: 提示找不到 psql？

**A**: psql 没有安装或不在 PATH 中。使用 Docker 方式执行：

```powershell
docker exec -it blog-postgres psql -U blog -d blog -c "UPDATE article SET slug = CONCAT('post-', id) WHERE slug IS NULL OR slug = '';"
```

### Q2: 连接被拒绝？

**A**: 检查 Docker 容器是否运行：

```powershell
# 检查容器状态
docker ps | grep blog-postgres

# 如果没有运行，启动所有服务
cd docker
docker-compose up -d
```

### Q3: 密码错误？

**A**: 如果你修改过 `.env` 文件中的密码，请编辑 `fix-postgres-slug.ps1` 文件，将密码改为你设置的值。

查看实际使用的密码：
```powershell
cat .env
```

如果 `.env` 中是 `your_secure_password`，则使用默认密码 `blog123`。

---

## 📝 完整修复流程（推荐）

```powershell
# 1. 确保 Docker 容器运行
cd d:\Blog\main\blog-system\docker
docker-compose ps

# 2. 执行修复脚本
powershell -ExecutionPolicy Bypass -File .\fix-postgres-slug.ps1

# 3. 查看输出，确认修复成功

# 4. 重启 Next.js
cd ..\blog-web
Ctrl+C  # 停止当前服务
rm -r .next
npm run dev

# 5. 打开浏览器测试
# http://localhost:3000
```

---

## ✅ 验证成功标志

修复成功后，你应该能够：

1. ✅ 在首页看到文章列表
2. ✅ 每篇文章都有 `slug` 字段（格式：`post-1`, `post-2`...）
3. ✅ 点击"阅读全文"能正常跳转
4. ✅ 文章详情页正确显示内容
5. ✅ 浏览器控制台没有错误

---

## 🔍 调试技巧

如果修复后仍然 404，打开浏览器控制台查看：

```javascript
// 在控制台查看 API 返回的数据
fetch('http://localhost:8080/api/articles?page=1&size=10')
  .then(r => r.json())
  .then(d => console.table(d.records.map(a => ({
    id: a.id,
    title: a.title,
    slug: a.slug
  }))))
```

应该看到类似输出：
```
id | title          | slug
1  | "第一篇文章"   | "post-1"
2  | "第二篇文章"   | "post-2"
```

---

**下一步**: 执行完修复脚本后，重启 Next.js 并测试文章链接！🎉

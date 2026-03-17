# 前端项目本地启动指南

## 📋 前置要求

1. **Node.js 版本**: 建议 v20.19.0 或更高版本
   - 如果版本较低，可以忽略 `EBADENGINE` 警告，不影响功能
   
2. **后端服务**: 确保 Docker 后端已启动
   ```powershell
   # 检查后端容器状态
   docker ps
   
   # 应该看到以下容器：
   # - blog-web-api (端口 8080)
   # - blog-admin-api (端口 8081)
   # - blog-postgres (数据库)
   # - blog-redis (缓存)
   ```

---

## 🚀 启动步骤

### 1️⃣ 后台管理前端 (blog-admin)

```powershell
# 进入项目目录
cd d:\Blog\main\blog-system\blog-admin

# 安装依赖（如果还没安装）
npm install --legacy-peer-deps

# 启动开发服务器
npm run dev
```

**访问地址**: http://localhost:5173

**功能**:
- ✅ 已配置 API 连接到 `http://localhost:8081`
- ✅ 页面加载时自动测试 API 连接
- ✅ 显示文章列表（如果后端有数据）

---

### 2️⃣ 前台网站 (blog-web)

```powershell
# 进入项目目录
cd d:\Blog\main\blog-system\blog-web

# 安装依赖（如果还没安装）
npm install --legacy-peer-deps

# 启动开发服务器
npm run dev
```

**访问地址**: http://localhost:3000

**功能**:
- ✅ 已配置 API 连接到 `http://localhost:8080`
- ✅ 准备就绪的 API 工具类

---

## 🔧 配置文件说明

### 环境变量文件

已为你创建以下配置文件：

**blog-admin/.env.local**
```env
VITE_API_URL=http://localhost:8081
VITE_WEB_API_URL=http://localhost:8080
```

**blog-web/.env.local**
```env
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_ADMIN_API_URL=http://localhost:8081
```

### API 工具类

**blog-admin/src/lib/api.ts**
- `adminApi` - 管理后台 API（增删改查）
- `webApi` - 前台 API（用于预览等）

**blog-web/src/lib/api.ts**
- `articleApi` - 文章相关 API
- `adminArticleApi` - 管理端文章 API

---

## ⚠️ 常见问题

### 1. Node.js 版本警告
```
npm warn EBADENGINE Unsupported engine
```
**解决方案**: 可以安全忽略，或使用以下命令安装：
```powershell
npm install --legacy-peer-deps
```

### 2. API 连接失败
如果出现网络错误，请检查：
```powershell
# 检查后端容器是否运行
docker ps | Select-String "blog-"

# 检查端口是否监听
netstat -ano | Select-String "8080|8081"
```

### 3. CORS 跨域问题
如果遇到跨域错误，需要在后端添加 CORS 配置。我可以帮你添加。

---

## 📝 下一步开发建议

### 后台管理 (blog-admin)
1. 完善管理员登录功能
2. 添加文章编辑器（已集成 Editor.js）
3. 实现分类和标签管理界面
4. 添加图片上传功能（可对接阿里云 OSS）

### 前台网站 (blog-web)
1. 设计首页文章列表
2. 实现文章详情页
3. 添加分类/标签筛选
4. 实现评论功能

---

## 🎯 快速测试

启动 admin 后，打开浏览器控制台 (F12)，你会看到：
- ✅ `Articles fetched: ...` - API 调用成功
- ❌ 错误信息 - 后端未启动或无数据

点击页面上的 **"Load Articles from API"** 按钮可以手动刷新数据。

---

## 📞 需要帮助？

如果需要：
- 添加更多 API 接口
- 实现具体功能页面
- 解决跨域问题
- 配置生产环境构建

请随时告诉我！

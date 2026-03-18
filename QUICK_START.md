# 🚀 快速启动指南

## 方式一：一键启动（推荐）

### Windows PowerShell
```powershell
.\start-all.ps1
```

这个脚本会自动：
1. ✅ 检查 Node.js 和 Java 环境
2. ✅ 启动前台博客服务（Next.js）
3. ✅ 启动管理后台服务（Vite）
4. ✅ 显示访问地址

**注意**: 后端服务需要通过 Docker 或 Maven 单独启动

---

## 方式二：手动启动

### 步骤 1: 启动后端服务

#### 使用 Docker（推荐）
```bash
cd docker
docker-compose up
```

#### 使用 Maven
```bash
cd blog-api
mvn clean install
mvn spring-boot:run
```

后端服务将启动在:
- Web API: http://localhost:8080
- Admin API: http://localhost:8081

### 步骤 2: 启动前台博客

```bash
cd blog-web
npm install
npm run dev
```

访问：http://localhost:3000

### 步骤 3: 启动管理后台

```bash
cd blog-admin
npm install
npm run dev
```

访问：http://localhost:5173

---

## 📋 访问地址汇总

| 服务 | 地址 | 说明 |
|------|------|------|
| 📖 前台博客 | http://localhost:3000 | 博客首页 |
| 🔧 管理后台 | http://localhost:5173 | 后台管理 |
| 🔌 Web API | http://localhost:8080 | 前台接口 |
| 🔌 Admin API | http://localhost:8081 | 管理接口 |

---

## ✅ 测试步骤

### 1. 发布第一篇文章

1. 访问管理后台：http://localhost:5173
2. 点击左侧"文章管理"
3. 点击"+ 新建文章"
4. 填写信息：
   - **标题**: 我的第一篇文章
   - **摘要**: 这是摘要...
   - **内容**: 文章内容支持 HTML...
   - **封面图**: 可选图片 URL
5. 点击"保存"

### 2. 查看博客

1. 访问前台：http://localhost:3000
2. 查看刚发布的文章
3. 点击文章标题查看详情
4. 查看分类和标签

### 3. 管理分类和标签

1. 返回管理后台
2. 点击"分类管理" → 创建分类
3. 点击"标签管理" → 创建标签
4. 编辑文章时可以选择分类和标签

---

## 🐛 常见问题

### Q1: 前端无法连接后端？
**A**: 确保后端服务已启动，并检查端口是否正确

### Q2: npm install 失败？
**A**: 尝试使用淘宝镜像：
```bash
npm config set registry https://registry.npmmirror.com
npm install
```

### Q3: Docker 启动失败？
**A**: 检查 Docker 是否运行，端口是否被占用

### Q4: 页面样式异常？
**A**: 清除浏览器缓存，刷新页面

---

## 📱 响应式测试

使用浏览器开发者工具测试不同设备：
- 📱 手机：375px × 667px
- 📱 平板：768px × 1024px  
- 💻 桌面：1920px × 1080px

---

## 🎯 下一步

1. 发布几篇测试文章
2. 创建分类和标签
3. 体验前台展示效果
4. 根据需要调整样式

---

**祝你使用愉快！** 🎉

如有问题，请查看 `FRONTEND_IMPLEMENTATION.md` 获取详细说明。

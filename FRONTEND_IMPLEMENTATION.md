# 博客系统 - 前端实现说明

## 📋 已实现功能

### ✅ 前台博客系统 (Next.js)
- **首页**
  - 文章列表展示（分页）
  - 侧边栏分类展示
  - 侧边栏标签展示
  - 响应式布局
  - 加载状态和错误处理
  
- **文章详情页**
  - 文章完整内容展示
  - 封面图片显示
  - 分类和标签显示
  - 阅读量统计
  - 创建时间显示
  - 分享功能（UI）
  - 上一篇/下一篇导航（预留）

### ✅ 管理后台系统 (Vite + React)
- **仪表盘**
  - 统计数据展示（文章总数、总阅读量、分类数、标签数）
  - 最新文章列表
  
- **文章管理**
  - 文章列表展示
  - 新建文章
  - 编辑文章
  - 删除文章
  - 文章状态（已发布/草稿）
  
- **分类管理**
  - 分类列表展示
  - 新建分类
  - 编辑分类
  - 删除分类
  - 排序功能
  
- **标签管理**
  - 标签列表展示
  - 新建标签
  - 编辑标签
  - 删除标签

## 🚀 快速开始

### 前置要求
- Node.js 18+ 
- Java 17+
- Maven 3.6+
- Docker（可选，用于部署）

### 方式一：分别启动

#### 1. 启动后端服务
```bash
# 使用 Docker（推荐）
cd docker
docker-compose up

# 或使用 Maven
cd blog-api
mvn clean install
mvn spring-boot:run
```

后端将启动在：
- Web API: http://localhost:8080
- Admin API: http://localhost:8081

#### 2. 启动前台博客
```bash
cd blog-web
npm install
npm run dev
```

访问：http://localhost:3000

#### 3. 启动管理后台
```bash
cd blog-admin
npm install
npm run dev
```

访问：http://localhost:5173

### 方式二：一键启动所有服务

```bash
# PowerShell
.\start-all.ps1
```

这个脚本会自动：
1. 检查 Node.js 和 Java 环境
2. 启动前台 Next.js 服务
3. 启动管理后台 Vite 服务
4. 提示启动后端服务

## 📁 项目结构

```
blog-system/
├── blog-web/              # 前台博客 (Next.js)
│   ├── src/
│   │   ├── app/          # 页面路由
│   │   │   ├── article/[slug]/  # 文章详情页
│   │   │   └── page.tsx         # 首页
│   │   ├── lib/          # API 工具
│   │   └── types/        # TypeScript 类型定义
│   └── package.json
│
├── blog-admin/           # 管理后台 (Vite + React)
│   ├── src/
│   │   ├── App.tsx      # 主应用组件
│   │   ├── lib/         # API 工具
│   │   └── types/       # TypeScript 类型定义
│   └── package.json
│
└── blog-api/            # 后端 API (Spring Boot)
    ├── blog-web-api/    # 前台 API
    └── blog-admin-api/  # 管理后台 API
```

## 🔧 技术栈

### 前台博客
- **框架**: Next.js 16
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **状态管理**: React Hooks

### 管理后台
- **框架**: React 19
- **构建工具**: Vite
- **语言**: TypeScript
- **样式**: 自定义 CSS

### 后端 API
- **框架**: Spring Boot
- **ORM**: MyBatis-Plus
- **数据库**: MySQL
- **缓存**: Redis（可选）

## 🎨 界面预览

### 前台博客
- 简洁现代的设计风格
- 响应式布局，支持移动端
- 卡片式文章展示
- 优雅的排版和阅读体验

### 管理后台
- 左侧导航栏布局
- 仪表盘数据统计
- 表格化数据展示
- 表单操作对话框
- 清晰的视觉层次

## 📝 使用说明

### 发布第一篇文章

1. 访问管理后台：http://localhost:5173
2. 点击"文章管理"
3. 点击"+ 新建文章"
4. 填写文章信息：
   - 标题（必填）
   - 摘要（可选）
   - 内容（必填）
   - 封面图片 URL（可选）
5. 点击"保存"

### 查看文章

1. 访问前台博客：http://localhost:3000
2. 在首页查看文章列表
3. 点击文章标题查看详情

## 🔌 API 接口

### 前台 API (http://localhost:8080)
- `GET /api/articles` - 获取文章列表（分页）
- `GET /api/articles/{slug}` - 获取文章详情
- `GET /api/articles/hot` - 获取热门文章
- `GET /api/categories` - 获取分类列表
- `GET /api/tags` - 获取标签列表

### 管理后台 API (http://localhost:8081)
- `GET /api/admin/articles` - 获取所有文章
- `POST /api/admin/articles` - 创建文章
- `PUT /api/admin/articles/{id}` - 更新文章
- `DELETE /api/admin/articles/{id}` - 删除文章
- 分类和标签的 CRUD 接口类似

## ⚙️ 配置

### 环境变量

#### 前台 (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_ADMIN_API_URL=http://localhost:8081
```

#### 管理后台 (.env.local)
```env
VITE_API_URL=http://localhost:8081
VITE_WEB_API_URL=http://localhost:8080
```

## 🐛 常见问题

### 1. 前端无法连接后端
- 检查后端服务是否启动
- 确认端口号正确（8080/8081）
- 检查 CORS 配置

### 2. 页面样式异常
- 清除浏览器缓存
- 重新安装依赖：`npm install`
- 重启开发服务器

### 3. TypeScript 报错
- 运行 `npm run build` 查看详细错误
- 检查类型定义文件
- 确保依赖版本兼容

## 📱 响应式支持

所有页面都支持响应式布局：
- 📱 移动端 (< 768px)
- 📱 平板端 (768px - 1024px)
- 💻 桌面端 (> 1024px)

## 🎯 下一步优化建议

1. **用户认证**
   - 添加登录功能
   - JWT Token 验证
   - 权限管理

2. **富文本编辑器**
   - 集成 Editor.js
   - Markdown 支持
   - 图片上传

3. **评论系统**
   - 文章评论功能
   - 评论审核
   - 回复功能

4. **搜索功能**
   - 全文搜索
   - 高级筛选
   - Elasticsearch 集成

5. **性能优化**
   - 图片懒加载
   - 虚拟滚动
   - CDN 集成

## 📄 License

MIT

# 博客系统项目文档

## 目录

1. [项目概述](#1-项目概述)
2. [技术架构](#2-技术架构)
3. [项目结构](#3-项目结构)
4. [后端API文档](#4-后端api文档)
5. [前端组件文档](#5-前端组件文档)
6. [数据库设计](#6-数据库设计)
7. [核心业务逻辑](#7-核心业务逻辑)
8. [部署指南](#8-部署指南)

---

## 1. 项目概述

### 1.1 项目简介

这是一个全栈博客系统，包含前台展示、后台管理、用户认证、评论系统、全文搜索等功能。采用前后端分离架构，支持 Docker 容器化部署。

### 1.2 功能特性

| 模块 | 功能描述 |
|------|----------|
| **文章管理** | 文章的增删改查、分类标签管理、Markdown编辑器、图片上传 |
| **评论系统** | 嵌套评论（支持回复）、层级展示、Markdown渲染 |
| **用户系统** | 用户注册（需注册码）、登录认证、角色权限（管理员/普通用户） |
| **搜索功能** | 基于 Meilisearch 的全文搜索、高亮显示 |
| **分类标签** | 文章分类和标签管理 |
| **图片管理** | 图片上传、缩略图生成、关联文章 |

### 1.3 技术栈

**后端**
- Java 21 + Spring Boot 3.1.11
- MyBatis-Plus 3.5.9（ORM框架）
- PostgreSQL 15（主数据库）
- Redis 7（缓存、Token存储）
- Meilisearch（全文搜索引擎）
- JWT（身份认证）
- BCrypt（密码加密）

**前端**
- Next.js 16 + React 19（前台）
- Vite + React 19（后台管理）
- Tailwind CSS 4（样式）
- EditorJS（富文本编辑器）
- React Markdown（Markdown渲染）

**部署**
- Docker + Docker Compose
- Nginx（反向代理、静态资源服务）

---

## 2. 技术架构

### 2.1 系统架构图

```
┌─────────────────────────────────────────────────────────────┐
│                         客户端                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   前台Web    │  │   后台管理   │  │    移动端    │      │
│  │  (Next.js)   │  │   (Vite)     │  │   (未来)     │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
└─────────┼─────────────────┼─────────────────┼──────────────┘
          │                 │                 │
          └─────────────────┼─────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                      Nginx (80/443)                         │
│              反向代理 / 静态资源 / 负载均衡                   │
└───────────────────────────┬─────────────────────────────────┘
                            │
          ┌─────────────────┼─────────────────┐
          │                 │                 │
┌─────────▼────────┐ ┌──────▼──────┐ ┌───────▼────────┐
│   Web API        │ │  Admin API  │ │  Uploads       │
│   (8080)         │ │  (8081)     │ │  (静态文件)     │
│                  │ │             │ │                │
│ • 文章查询       │ │ • 文章管理  │ │ • 图片文件     │
│ • 评论提交       │ │ • 用户管理  │ │ • 缩略图       │
│ • 用户注册       │ │ • 评论审核  │ │                │
│ • 搜索           │ │ • 系统配置  │ │                │
└─────────┬────────┘ └──────┬──────┘ └────────────────┘
          │                 │
          └─────────────────┼─────────────────┐
                            │                 │
┌───────────────────────────▼────────┐ ┌──────▼──────┐
│         PostgreSQL (5432)          │ │ Redis (6379)│
│                                    │ │             │
│ • 文章/分类/标签/评论/用户/图片    │ │ • Token存储 │
│ • 注册码                           │ │ • 会话缓存  │
└────────────────────────────────────┘ └─────────────┘
                            │
┌───────────────────────────▼────────┐
│      Meilisearch (7700)            │
│                                    │
│ • 文章全文索引                     │
│ • 搜索高亮                         │
└────────────────────────────────────┘
```

### 2.2 后端模块结构

```
blog-api (Maven父项目)
├── blog-common          # 公共模块（工具类、常量）
├── blog-core            # 核心业务模块
│   ├── entity           # 实体类
│   ├── mapper           # MyBatis映射器
│   ├── service          # 业务逻辑接口及实现
│   ├── dto              # 数据传输对象
│   ├── config           # 配置类
│   ├── interceptor      # 拦截器
│   └── event            # 事件处理
├── blog-web-api         # 前台API服务（端口8080）
│   └── controller       # Web端控制器
└── blog-admin-api       # 后台API服务（端口8081）
    └── controller       # 管理端控制器
```

### 2.3 前端项目结构

**前台 (blog-web)**
```
blog-web/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── page.tsx         # 首页
│   │   ├── article/[slug]/  # 文章详情页
│   │   ├── search/          # 搜索页
│   │   └── register/        # 注册页
│   ├── components/          # 组件
│   │   ├── layout/          # 布局组件
│   │   ├── home/            # 首页组件
│   │   ├── article/         # 文章页组件
│   │   └── common/          # 通用组件
│   ├── hooks/               # 自定义Hooks
│   ├── lib/                 # 工具函数、API
│   └── types/               # TypeScript类型
```

**后台 (blog-admin)**
```
blog-admin/
├── src/
│   ├── components/          # 组件
│   │   ├── layout/          # 布局组件
│   │   └── common/          # 通用组件
│   ├── pages/               # 页面组件
│   │   ├── Articles/        # 文章管理
│   │   ├── Categories/      # 分类管理
│   │   ├── Tags/            # 标签管理
│   │   ├── Comments/        # 评论管理
│   │   ├── Users/           # 用户管理
│   │   ├── RegistrationCodes/ # 注册码管理
│   │   └── Dashboard/       # 仪表盘
│   ├── lib/                 # API、工具
│   └── types/               # TypeScript类型
```

---

## 3. 项目结构

### 3.1 完整目录树

```
blog-system/
├── blog-api/                    # 后端项目
│   ├── pom.xml                  # Maven父POM
│   ├── blog-common/             # 公共模块
│   ├── blog-core/               # 核心模块
│   │   └── src/main/java/com/blog/core/
│   │       ├── entity/          # 实体类
│   │       ├── mapper/          # MyBatis Mapper
│   │       ├── service/         # 服务层
│   │       │   └── impl/        # 实现类
│   │       ├── dto/             # DTO
│   │       ├── config/          # 配置
│   │       ├── interceptor/     # 拦截器
│   │       └── event/           # 事件
│   ├── blog-web-api/            # Web API模块
│   │   └── src/main/java/com/blog/web/
│   │       └── controller/      # Web控制器
│   └── blog-admin-api/          # Admin API模块
│       └── src/main/java/com/blog/admin/
│           ├── controller/      # Admin控制器
│           └── dto/             # Admin DTO
│
├── blog-web/                    # 前台前端 (Next.js)
│   ├── src/
│   │   ├── app/                 # App Router
│   │   ├── components/          # 组件
│   │   ├── hooks/               # Hooks
│   │   ├── lib/                 # API、工具
│   │   └── types/               # 类型定义
│   ├── package.json
│   └── next.config.ts
│
├── blog-admin/                  # 后台前端 (Vite)
│   ├── src/
│   │   ├── components/          # 组件
│   │   ├── pages/               # 页面
│   │   ├── lib/                 # API、工具
│   │   └── types/               # 类型定义
│   ├── package.json
│   └── vite.config.ts
│
└── docker/                      # Docker部署
    ├── docker-compose.yml       # 编排配置
    ├── nginx.conf               # Nginx配置
    ├── Dockerfile.web           # Web API镜像
    ├── Dockerfile.admin         # Admin API镜像
    ├── init.sql                 # 数据库初始化
    └── uploads/                 # 上传文件目录
```

---

## 4. 后端API文档

### 4.1 基础信息

| 项目 | 值 |
|------|-----|
| Web API 基础URL | `http://localhost:8080` |
| Admin API 基础URL | `http://localhost:8081` |
| 认证方式 | JWT Token (Header: `Authorization: {token}`) |
| 数据格式 | JSON |

### 4.2 通用响应格式

**分页响应 (PageResponse<T>)**

```json
{
  "records": [],      // 数据列表
  "total": 100,       // 总记录数
  "size": 10,         // 每页大小
  "current": 1,       // 当前页码
  "pages": 10         // 总页数
}
```

### 4.3 Web API 端点

#### 4.3.1 文章接口

**获取文章列表**

```http
GET /api/articles?page={page}&size={size}&categoryId={categoryId}&tagId={tagId}
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | int | 否 | 页码，默认1 |
| size | int | 否 | 每页大小，默认10 |
| categoryId | long | 否 | 分类ID筛选 |
| tagId | long | 否 | 标签ID筛选 |

**响应示例：**
```json
{
  "records": [
    {
      "id": 1,
      "title": "文章标题",
      "slug": "article-slug",
      "summary": "文章摘要",
      "content": "文章内容",
      "coverImage": "/uploads/xxx.jpg",
      "status": 1,
      "viewCount": 100,
      "categoryId": 1,
      "category": { "id": 1, "name": "技术" },
      "tags": [{ "id": 1, "name": "Java" }],
      "createTime": "2024-01-01T10:00:00",
      "updateTime": "2024-01-01T10:00:00"
    }
  ],
  "total": 50,
  "size": 10,
  "current": 1,
  "pages": 5
}
```

**获取文章详情**

```http
GET /api/articles/{slug}
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| slug | string | 是 | 文章URL标识 |

**获取热门文章**

```http
GET /api/articles/hot?limit={limit}
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| limit | int | 否 | 返回数量，默认5 |

---

#### 4.3.2 评论接口

**获取文章评论**

```http
GET /api/comments/article/{articleId}
```

**响应示例：**
```json
[
  {
    "id": 1,
    "articleId": 1,
    "parentId": null,
    "rootId": 1,
    "authorName": "张三",
    "authorEmail": "zhangsan@example.com",
    "authorWebsite": "https://example.com",
    "content": "评论内容（支持Markdown）",
    "createTime": "2024-01-01T10:00:00",
    "children": [
      {
        "id": 2,
        "parentId": 1,
        "rootId": 1,
        "authorName": "李四",
        "content": "回复内容",
        "createTime": "2024-01-01T11:00:00"
      }
    ]
  }
]
```

**提交评论**

```http
POST /api/comments
Content-Type: application/json

{
  "articleId": 1,
  "parentId": null,        // 回复评论时填写父评论ID
  "authorName": "访客",
  "authorEmail": "visitor@example.com",
  "authorWebsite": "https://example.com",
  "content": "评论内容"
}
```

---

#### 4.3.3 分类接口

**获取分类列表**

```http
GET /api/categories
```

**响应示例：**
```json
[
  {
    "id": 1,
    "name": "技术",
    "slug": "tech",
    "description": "技术文章",
    "sortOrder": 1,
    "createTime": "2024-01-01T10:00:00"
  }
]
```

---

#### 4.3.4 标签接口

**获取标签列表**

```http
GET /api/tags
```

---

#### 4.3.5 搜索接口

**搜索文章**

```http
GET /api/search?query={keyword}&page={page}&size={size}
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| query | string | 是 | 搜索关键词 |
| page | int | 否 | 页码，默认1 |
| size | int | 否 | 每页大小，默认10 |

**响应示例：**
```json
{
  "hits": [
    {
      "id": 1,
      "title": "Spring Boot 入门",
      "summary": "Spring Boot 入门教程",
      "slug": "spring-boot-intro",
      "coverImage": "/uploads/xxx.jpg",
      "categoryName": "技术",
      "viewCount": 100,
      "createTime": "2024-01-01 10:00:00",
      "highlightedTitle": "<em>Spring</em> Boot 入门",
      "highlightedContent": "<em>Spring</em> Boot 是一个快速开发框架..."
    }
  ],
  "totalHits": 50,
  "processingTimeMs": 15,
  "page": 1,
  "pageSize": 10
}
```

---

#### 4.3.6 注册接口

**用户注册**

```http
POST /api/register
Content-Type: application/json

{
  "username": "newuser",
  "password": "password123",
  "email": "user@example.com",
  "nickname": "新用户",
  "registrationCode": "ABC123XYZ"
}
```

**响应示例：**
```json
{
  "success": true,
  "message": "注册成功",
  "userId": 100
}
```

---

### 4.4 Admin API 端点

#### 4.4.1 认证接口

**登录**

```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

**响应示例：**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@example.com",
    "nickname": "管理员",
    "avatar": null,
    "role": 1
  }
}
```

**获取当前用户**

```http
GET /api/auth/me
Authorization: {token}
```

**退出登录**

```http
POST /api/auth/logout
Authorization: {token}
```

---

#### 4.4.2 文章管理

| 接口 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 获取文章列表 | GET | `/api/admin/articles?page={page}&size={size}` | 分页查询 |
| 获取文章详情 | GET | `/api/admin/articles/{id}` | 根据ID获取 |
| 创建文章 | POST | `/api/admin/articles` | 新建文章 |
| 更新文章 | PUT | `/api/admin/articles/{id}` | 更新文章 |
| 删除文章 | DELETE | `/api/admin/articles/{id}` | 删除文章 |

**创建/更新文章请求体：**
```json
{
  "article": {
    "title": "文章标题",
    "slug": "article-slug",
    "summary": "文章摘要",
    "content": "文章内容（EditorJS JSON格式）",
    "coverImage": "/uploads/xxx.jpg",
    "status": 1,           // 0:草稿 1:发布
    "categoryId": 1
  },
  "tagIds": [1, 2, 3]     // 标签ID列表
}
```

---

#### 4.4.3 分类管理

| 接口 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 获取分类列表 | GET | `/api/admin/categories` | 获取所有 |
| 创建分类 | POST | `/api/admin/categories` | 新建分类 |
| 更新分类 | PUT | `/api/admin/categories/{id}` | 更新分类 |
| 删除分类 | DELETE | `/api/admin/categories/{id}` | 删除分类 |

**分类请求体：**
```json
{
  "name": "技术",
  "slug": "tech",
  "description": "技术文章",
  "sortOrder": 1
}
```

---

#### 4.4.4 标签管理

| 接口 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 获取标签列表 | GET | `/api/admin/tags` | 获取所有 |
| 创建标签 | POST | `/api/admin/tags` | 新建标签 |
| 更新标签 | PUT | `/api/admin/tags/{id}` | 更新标签 |
| 删除标签 | DELETE | `/api/admin/tags/{id}` | 删除标签 |

---

#### 4.4.5 评论管理

| 接口 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 获取评论列表 | GET | `/api/admin/comments?page={page}&size={size}` | 分页查询 |
| 获取文章评论 | GET | `/api/admin/comments/article/{articleId}` | 按文章筛选 |
| 删除评论 | DELETE | `/api/admin/comments/{id}` | 删除评论 |
| 回复评论 | POST | `/api/admin/comments/{parentId}/reply` | 管理员回复 |

---

#### 4.4.6 用户管理

| 接口 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 获取用户列表 | GET | `/api/admin/users?page={page}&size={size}` | 分页查询 |
| 创建用户 | POST | `/api/admin/users` | 新建用户 |
| 更新用户状态 | PUT | `/api/admin/users/{id}/status` | 启用/禁用 |
| 删除用户 | DELETE | `/api/admin/users/{id}` | 删除用户 |

**创建用户请求体：**
```json
{
  "username": "newuser",
  "password": "password123",
  "email": "user@example.com",
  "nickname": "新用户",
  "role": 0    // 0:普通用户 1:管理员
}
```

**更新状态请求体：**
```json
{
  "status": 1   // 0:禁用 1:启用
}
```

---

#### 4.4.7 注册码管理

| 接口 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 获取注册码列表 | GET | `/api/admin/registration-codes?page={page}&size={size}` | 分页查询 |
| 生成注册码 | POST | `/api/admin/registration-codes` | 生成新码 |
| 删除注册码 | DELETE | `/api/admin/registration-codes/{id}` | 删除 |

**生成注册码请求体：**
```json
{
  "type": 0,           // 0:普通用户码 1:管理员码
  "expireHours": 24    // 过期小时数
}
```

---

#### 4.4.8 图片管理

| 接口 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 上传图片 | POST | `/api/admin/images/upload` | 上传文件 |
| 获取图片列表 | GET | `/api/admin/images?articleId={id}` | 按文章筛选 |
| 获取图片详情 | GET | `/api/admin/images/{id}` | 获取信息 |
| 获取图片URL | GET | `/api/admin/images/{id}/url` | 获取原图URL |
| 获取缩略图URL | GET | `/api/admin/images/{id}/thumbnail` | 获取缩略图URL |
| 删除图片 | DELETE | `/api/admin/images/{id}` | 删除图片 |

**上传图片请求：**
```http
POST /api/admin/images/upload
Content-Type: multipart/form-data

file: [二进制文件]
articleId: [可选]关联文章ID
```

**响应示例：**
```json
{
  "id": 1,
  "originalName": "photo.jpg",
  "fileName": "uuid.jpg",
  "url": "/uploads/images/1/uuid.jpg",
  "thumbnailUrl": "/uploads/images/1/thumbs/uuid.jpg",
  "width": 1920,
  "height": 1080,
  "fileSize": 1024000,
  "createTime": "2024-01-01T10:00:00"
}
```

---

## 5. 前端组件文档

### 5.1 前台组件 (blog-web)

#### 5.1.1 通用组件

**Loading 加载组件**

```typescript
interface LoadingProps {
  message?: string;      // 加载提示文字，默认"加载中..."
  size?: 'sm' | 'md' | 'lg';  // 尺寸，默认'md'
  fullScreen?: boolean;  // 是否全屏，默认false
}

// 使用示例
<Loading message="加载文章中..." size="lg" fullScreen />
```

**ErrorState 错误状态组件**

```typescript
interface ErrorStateProps {
  message: string;              // 错误信息（必填）
  showBackLink?: boolean;       // 是否显示返回链接，默认true
  backLinkText?: string;        // 返回链接文字，默认"返回首页"
  backLinkHref?: string;        // 返回链接地址，默认"/"
  additionalInfo?: string;      // 附加信息
}

// 使用示例
<ErrorState 
  message="文章加载失败" 
  additionalInfo="请检查网络连接"
  showBackLink={true}
/>
```

**EmptyState 空状态组件**

```typescript
interface EmptyStateProps {
  message: string;              // 提示信息（必填）
  icon?: 'search' | 'box' | 'file';  // 图标类型，默认'box'
  className?: string;           // 自定义类名
}

// 使用示例
<EmptyState message="暂无文章" icon="box" />
<EmptyState message="未找到搜索结果" icon="search" />
```

---

#### 5.1.2 Hooks

**useAuth 认证Hook**

```typescript
interface UseAuthReturn {
  currentUser: User | null;           // 当前登录用户
  showLoginModal: boolean;            // 是否显示登录弹窗
  setShowLoginModal: (show: boolean) => void;
  handleLoginSuccess: (user: User, token: string) => void;
  handleLogout: () => void;
  checkAuth: () => boolean;           // 检查是否已登录
}

// 使用示例
const { 
  currentUser, 
  showLoginModal, 
  setShowLoginModal,
  handleLoginSuccess,
  handleLogout 
} = useAuth();
```

---

#### 5.1.3 API 模块

**文章 API**

```typescript
articleApi.getArticles(page, size, categoryId?, tagId?): Promise<PageResponse<Article>>
articleApi.getArticle(slug: string): Promise<Article>
articleApi.getHotArticles(limit?: number): Promise<Article[]>
articleApi.getArticlesByTag(tagId: number): Promise<Article[]>
```

**评论 API**

```typescript
commentApi.getByArticle(articleId: number): Promise<Comment[]>
commentApi.create(data: Partial<Comment>): Promise<Comment>
```

**搜索 API**

```typescript
searchApi.search(query: string, page?: number, size?: number): Promise<SearchResult>
```

**认证 API**

```typescript
authApi.login(data: { username: string; password: string }): Promise<{ token: string; user: User }>
authApi.getCurrentUser(): Promise<User>
authApi.logout(): Promise<void>
```

---

### 5.2 后台组件 (blog-admin)

#### 5.2.1 页面组件

**ArticlesPage 文章管理页**

```typescript
interface ArticlesPageProps {
  categories: Category[];  // 分类列表（从父组件传入）
  tags: Tag[];             // 标签列表（从父组件传入）
}
```

**功能：**
- 文章列表分页展示
- 新建/编辑文章（使用 EditorJS 编辑器）
- 文章状态切换（草稿/发布）
- 分类标签选择
- 图片上传

**CategoriesPage 分类管理页**

```typescript
interface CategoriesPageProps {
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
}
```

**CommentsPage 评论管理页**

- 评论列表分页展示
- 删除评论
- 管理员回复评论

**UsersPage 用户管理页**

- 用户列表分页展示
- 创建用户
- 启用/禁用用户
- 删除用户

**RegistrationCodesPage 注册码管理页**

- 注册码列表展示
- 生成新注册码（可设置类型和过期时间）
- 删除注册码

---

#### 5.2.2 Admin API 模块

```typescript
// 认证
adminApi.auth.login(data)
adminApi.auth.getCurrentUser()
adminApi.auth.logout()

// 文章管理
adminApi.articles.getAll(page, size, categoryId?, tagId?)
adminApi.articles.getById(id)
adminApi.articles.create(data: ArticleRequest)
adminApi.articles.update(id, data)
adminApi.articles.delete(id)

// 评论管理
adminApi.comments.getAll(page, size)
adminApi.comments.delete(id)
adminApi.comments.reply(parentId, data)

// 用户管理
adminApi.users.getAll(page, size)
adminApi.users.create(data)
adminApi.users.updateStatus(id, status)
adminApi.users.delete(id)

// 注册码管理
adminApi.registrationCodes.getAll(page, size)
adminApi.registrationCodes.generate({ type, expireHours })
adminApi.registrationCodes.delete(id)

// 图片管理
adminApi.images.upload(file, articleId?)
adminApi.images.getByArticle(articleId)
adminApi.images.delete(id)
```

---

## 6. 数据库设计

### 6.1 ER 图

```
┌─────────────┐       ┌─────────────────┐       ┌─────────────┐
│  category   │       │     article     │       │    tag      │
├─────────────┤       ├─────────────────┤       ├─────────────┤
│ id (PK)     │◄──────┤ id (PK)         │──────►│ id (PK)     │
│ name        │   1:N │ title           │  N:M  │ name        │
│ slug        │       │ slug (UK)       │       │ slug (UK)   │
│ description │       │ summary         │       └─────────────┘
│ sort_order  │       │ content         │            ▲
└─────────────┘       │ cover_image     │            │
                      │ status          │    ┌─────────────┐
                      │ view_count      │    │ article_tag │
                      │ category_id(FK) │◄───├─────────────┤
                      │ create_time     │    │ article_id  │
                      │ update_time     │    │ tag_id      │
                      └────────┬────────┘    └─────────────┘
                               │
                               │ 1:N
                               ▼
                      ┌─────────────────┐
                      │     comment     │
                      ├─────────────────┤
                      │ id (PK)         │
                      │ article_id (FK) │
                      │ parent_id (FK)  │──┐
                      │ root_id (FK)    │  │
                      │ author_name     │  │ 自关联（回复）
                      │ author_email    │  │
                      │ content         │◄─┘
                      │ create_time     │
                      └─────────────────┘

┌─────────────┐       ┌───────────────────┐
│    users    │       │ registration_codes│
├─────────────┤       ├───────────────────┤
│ id (PK)     │◄──────┤ id (PK)           │
│ username    │  1:N  │ code (UK)         │
│ password    │       │ type              │
│ email       │       │ expire_time       │
│ nickname    │       │ is_used           │
│ role        │       │ used_by (FK)      │
│ status      │       │ used_time         │
└─────────────┘       └───────────────────┘

┌─────────────┐
│    image    │
├─────────────┤
│ id (PK)     │
│ article_id  │◄── 可选关联文章
│ original_name│
│ file_name   │
│ file_path   │
│ thumbnail_path│
│ file_size   │
│ width       │
│ height      │
└─────────────┘
```

### 6.2 表结构详解

**article 文章表**

| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT PK | 主键，自增 |
| title | VARCHAR(200) | 文章标题 |
| slug | VARCHAR(200) UK | URL标识（唯一） |
| summary | TEXT | 文章摘要 |
| content | TEXT | 文章内容（EditorJS JSON） |
| cover_image | VARCHAR(500) | 封面图片路径 |
| status | INT | 状态：0草稿 1发布 |
| view_count | INT | 浏览次数 |
| category_id | BIGINT FK | 分类ID |
| create_time | TIMESTAMP | 创建时间 |
| update_time | TIMESTAMP | 更新时间 |

**comment 评论表**

| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT PK | 主键 |
| article_id | BIGINT FK | 所属文章 |
| parent_id | BIGINT FK | 父评论ID（回复用） |
| root_id | BIGINT FK | 根评论ID（层级展示） |
| author_name | VARCHAR(100) | 评论者名称 |
| author_email | VARCHAR(100) | 邮箱 |
| author_website | VARCHAR(200) | 网站 |
| content | TEXT | 评论内容（Markdown） |
| ip | VARCHAR(50) | 评论者IP |
| user_agent | TEXT | 浏览器UA |
| create_time | TIMESTAMP | 创建时间 |

**users 用户表**

| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT PK | 主键 |
| username | VARCHAR(50) UK | 用户名（唯一） |
| password | VARCHAR(255) | BCrypt加密密码 |
| email | VARCHAR(100) UK | 邮箱（唯一） |
| nickname | VARCHAR(50) | 昵称 |
| avatar | VARCHAR(500) | 头像URL |
| role | INT | 角色：0普通用户 1管理员 |
| status | INT | 状态：0禁用 1启用 |

**registration_codes 注册码表**

| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT PK | 主键 |
| code | VARCHAR(32) UK | 注册码（唯一） |
| type | INT | 类型：0普通用户 1管理员 |
| expire_time | TIMESTAMP | 过期时间 |
| is_used | BOOLEAN | 是否已使用 |
| used_by | BIGINT FK | 使用用户ID |
| used_time | TIMESTAMP | 使用时间 |

---

## 7. 核心业务逻辑

### 7.1 评论系统层级结构

评论系统采用**根评论 + 扁平回复**的混合模式：

```
文章评论
├── 评论A (rootId=A.id, parentId=null)
│   ├── 回复A1 (rootId=A.id, parentId=A.id)
│   ├── 回复A2 (rootId=A.id, parentId=A.id)
│   └── 回复A3 (rootId=A.id, parentId=A.id)
│
├── 评论B (rootId=B.id, parentId=null)
│   └── 回复B1 (rootId=B.id, parentId=B.id)
│
└── 评论C (rootId=C.id, parentId=null)
```

**核心逻辑代码：**

```java
@Override
public List<CommentDTO> getCommentsByArticleId(Long articleId) {
    // 1. 一次性获取文章所有评论
    List<Comment> allComments = baseMapper.selectAllComments(articleId);

    // 2. 构建根评论 DTO（只包含 parentId 为 null 的）
    List<CommentDTO> rootDTOs = allComments.stream()
        .filter(c -> c.getParentId() == null)  // 筛选根评论
        .map(root -> {
            CommentDTO dto = toDTO(root);
            // 3. 找该根评论下所有回复
            List<CommentDTO> replies = allComments.stream()
                .filter(c -> c.getParentId() != null
                    && root.getId().equals(c.getRootId()))
                .map(this::toDTO)
                .collect(Collectors.toList());
            dto.setChildren(replies);
            return dto;
        })
        .collect(Collectors.toList());

    return rootDTOs;
}
```

**提交评论时的 rootId 计算：**

```java
@Override
public Comment addComment(Comment comment) {
    if (comment.getParentId() != null) {
        // 如果有父评论，继承父评论的 rootId
        Comment parentComment = getById(comment.getParentId());
        if (parentComment != null) {
            Long parentRootId = parentComment.getRootId();
            comment.setRootId(parentRootId != null ? parentRootId : parentComment.getId());
        }
    }

    save(comment);

    // 如果是根评论，设置自己的 rootId 为自己的 id
    if (comment.getParentId() == null) {
        comment.setRootId(comment.getId());
        updateById(comment);
    }

    return comment;
}
```

---

### 7.2 JWT + Redis 单设备登录

认证流程采用 JWT + Redis 双重验证机制：

```
┌─────────┐                    ┌─────────┐                    ┌─────────┐
│  客户端  │ ─── 登录请求 ─────► │  服务端  │ ─── 验证密码 ─────► │ 数据库  │
│         │                    │         │                    │         │
│         │ ◄── 返回Token ──── │         │ ◄── 用户信息 ────── │         │
│         │                    │         │                    │         │
│         │                    │    ┌────┴────┐               │         │
│         │                    │    │ 生成JWT │               │         │
│         │                    │    │ 存Redis │               │         │
│         │                    │    └────┬────┘               │         │
└────┬────┘                    └─────────┘                    └─────────┘
     │
     │ 后续请求（带Token）
     ▼
┌─────────┐     ┌─────────────────────────────────────────┐
│  服务端  │────►│ 1. 验证JWT签名和过期时间                  │
│         │     │ 2. 从JWT解析用户ID                        │
│         │     │ 3. 验证Redis中Token是否匹配（单设备检查）  │
│         │     │ 4. 自动续期Token有效期                    │
│         │     └─────────────────────────────────────────┘
```

**Token 验证代码：**

```java
@Override
public User validateToken(String token) {
    // 1. 验证JWT有效性
    if (!jwtTokenProvider.validateToken(token)) {
        return null;
    }
    
    // 2. 从JWT解析用户ID
    Long userId = jwtTokenProvider.getUserIdFromToken(token);
    if (userId == null) {
        return null;
    }
    
    // 3. 验证Redis中的Token（单设备登录检查）
    if (!redisTokenService.validateToken(userId, token)) {
        // Token不匹配，说明用户已在其他设备登录
        return null;
    }
    
    // 4. 自动续期Token（30天）
    redisTokenService.extendTokenTTL(userId, 2592000000L);
    
    return findById(userId);
}
```

---

### 7.3 文章搜索索引同步

使用 Spring Event 机制实现文章变更时的搜索索引自动同步：

```java
// 文章创建/更新/删除时发布事件
@Transactional
public Article createArticle(Article article, List<Long> tagIds) {
    // ... 保存文章逻辑
    
    // 发布创建事件
    eventPublisher.publishEvent(new ArticleEvent(this, article, ArticleEvent.EventType.CREATED));
    return article;
}

// 事件监听器处理索引更新
@Component
@Slf4j
@RequiredArgsConstructor
public class ArticleEventListener {
    
    private final SearchService searchService;
    
    @EventListener
    public void handleArticleEvent(ArticleEvent event) {
        Article article = event.getArticle();
        
        switch (event.getType()) {
            case CREATED:
                searchService.indexArticle(article);
                break;
            case UPDATED:
                searchService.updateArticleIndex(article);
                break;
            case DELETED:
                searchService.deleteArticleIndex(article.getId());
                break;
        }
    }
}
```

---

### 7.4 图片上传与缩略图生成

图片上传流程：

```java
@Override
@Transactional
public Image uploadImage(MultipartFile file, Long articleId) throws IOException {
    // 1. 生成唯一文件名
    String originalName = file.getOriginalFilename();
    String extension = getExtension(originalName);
    String fileName = UUID.randomUUID() + "." + extension;
    
    // 2. 保存原图
    Path filePath = Paths.get(uploadPath, fileName);
    Files.copy(file.getInputStream(), filePath);
    
    // 3. 生成缩略图（使用 Thumbnailator）
    String thumbnailName = "thumb_" + fileName;
    Path thumbnailPath = Paths.get(thumbnailPath, thumbnailName);
    Thumbnails.of(file.getInputStream())
        .size(300, 300)
        .keepAspectRatio(true)
        .toFile(thumbnailPath.toFile());
    
    // 4. 获取图片尺寸
    BufferedImage image = ImageIO.read(file.getInputStream());
    int width = image.getWidth();
    int height = image.getHeight();
    
    // 5. 保存到数据库
    Image imageEntity = new Image();
    imageEntity.setOriginalName(originalName);
    imageEntity.setFileName(fileName);
    imageEntity.setFilePath(filePath.toString());
    imageEntity.setThumbnailPath(thumbnailPath.toString());
    imageEntity.setWidth(width);
    imageEntity.setHeight(height);
    imageEntity.setFileSize(file.getSize());
    imageEntity.setArticleId(articleId);
    
    save(imageEntity);
    return imageEntity;
}
```

---

## 8. 部署指南

### 8.1 环境要求

| 组件 | 版本 | 说明 |
|------|------|------|
| Docker | 20.10+ | 容器运行时 |
| Docker Compose | 2.0+ | 编排工具 |
| Java | 21 | 开发环境（可选） |
| Node.js | 20+ | 前端开发（可选） |

### 8.2 目录结构准备

```bash
blog-system/
├── blog-api/           # 后端代码
├── blog-web/           # 前台前端代码
├── blog-admin/         # 后台前端代码
└── docker/             # 部署配置
    ├── docker-compose.yml
    ├── nginx.conf
    ├── Dockerfile.web
    ├── Dockerfile.admin
    ├── init.sql        # 数据库初始化
    └── uploads/        # 上传目录（需提前创建）
```

### 8.3 配置文件

**docker/.env 环境变量文件**

```bash
# 数据库密码
DB_PASSWORD=your_secure_password

# Meilisearch 密钥
MEILI_MASTER_KEY=your_meili_master_key

# JWT 密钥（生产环境必须修改）
JWT_SECRET=your_jwt_secret_key_min_32_chars
```

### 8.4 部署步骤

**1. 克隆代码并进入目录**

```bash
cd blog-system
```

**2. 创建上传目录**

```bash
mkdir -p docker/uploads/imagesmkdir -p docker/uploads/images/thumbs
```

**3. 配置环境变量**

```bash
cd docker
cp .env.example .env
# 编辑 .env 文件，设置安全的密码
```

**4. 启动服务**

```bash
# 完整启动（后台运行）
docker-compose up -d

# 查看日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f web-api
```

**5. 验证服务状态**

```bash
# 查看所有容器状态
docker-compose ps

# 测试Web API
curl http://localhost:8080/api/articles

# 测试Admin API
curl http://localhost:8081/api/auth/login \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### 8.5 服务访问地址

| 服务 | 地址 | 说明 |
|------|------|------|
| Nginx | http://localhost | 统一入口 |
| Web API | http://localhost:8080 | 前台API |
| Admin API | http://localhost:8081 | 后台API |
| PostgreSQL | localhost:5432 | 数据库 |
| Redis | localhost:6379 | 缓存 |
| Meilisearch | http://localhost:7700 | 搜索引擎 |

### 8.6 前端开发模式启动

**前台 (Next.js)**

```bash
cd blog-web
npm install
npm run dev
# 访问 http://localhost:3000
```

**后台 (Vite)**

```bash
cd blog-admin
npm install
npm run dev
# 访问 http://localhost:5173
```

### 8.7 生产环境构建

**构建前端静态文件**

```bash
# 构建前台
cd blog-web
npm run build
# 输出到 .next/ 目录

# 构建后台
cd blog-admin
npm run build
# 输出到 dist/ 目录
```

**重新部署后端**

```bash
cd docker

# 重新构建并启动
docker-compose up -d --build

# 只重启某个服务
docker-compose restart web-api
```

### 8.8 数据备份

**备份 PostgreSQL**

```bash
docker exec blog-postgres pg_dump -U blog blog > backup.sql
```

**备份上传文件**

```bash
tar -czvf uploads-backup.tar.gz docker/uploads/
```

### 8.9 常见问题

**1. 数据库连接失败**

检查环境变量 `DB_PASSWORD` 是否正确，确保与 `init.sql` 中的密码一致。

**2. 图片无法访问**

确保 `docker/uploads` 目录权限正确：
```bash
chmod -R 755 docker/uploads
```

**3. 搜索无结果**

首次部署需要初始化 Meilisearch 索引，可以通过调用 Admin API 触发重建：
```bash
curl http://localhost:8081/api/admin/search/rebuild \
  -H "Authorization: {your_token}"
```

**4. 端口冲突**

如果本地已有服务占用端口，修改 `docker-compose.yml` 中的端口映射：
```yaml
ports:
  - "8082:8080"  # 将Web API映射到8082
```

---

## 附录

### A. 默认账号

| 账号 | 密码 | 角色 |
|------|------|------|
| admin | admin123 | 管理员 |


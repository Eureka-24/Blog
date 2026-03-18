# 404 问题排查指南

## 问题现象
点击博客文章列表中的"阅读全文"后，进入文章详情页显示 404。

## 可能原因及解决方案

### 1. 文章缺少 slug 字段 ⭐ 最常见

**问题**: 后端数据库中的文章记录可能没有设置 `slug` 字段，导致前端生成的链接为 `/article/undefined` 或 `/article/null`。

**排查步骤**:

#### 方法一：浏览器控制台检查
1. 打开前台博客首页 (http://localhost:3000)
2. 按 F12 打开开发者工具
3. 切换到 Console 标签
4. 查看是否有文章数据的日志输出
5. 检查 `slug` 字段的值

#### 方法二：Network 检查
1. 在开发者工具中切换到 Network 标签
2. 刷新首页
3. 找到 `/api/articles` 请求
4. 查看响应数据中的 `slug` 字段

#### 方法三：直接访问 API
```bash
# 浏览器访问
http://localhost:8080/api/articles?page=1&size=10

# 或使用 curl
curl http://localhost:8080/api/articles?page=1&size=10
```

检查返回的 JSON 数据中每篇文章是否有 `slug` 字段。

### 2. Next.js 路由配置问题

**检查项目**:
- ✅ 动态路由文件夹命名：`[slug]`（正确）
- ✅ 页面文件位置：`src/app/article/[slug]/page.tsx`（正确）
- ⚠️ 需要重启开发服务器

**解决方法**:
```bash
# 停止当前运行的 Next.js 服务（Ctrl+C）
# 重新启动
cd blog-web
npm run dev
```

### 3. 后端 API 未返回 slug

**原因**: 创建文章时没有生成 slug，或者数据库表中缺少 slug 字段。

**解决方案 A: 通过管理后台创建文章时自动生成 slug**

修改后端代码，在保存文章时自动生成 slug：

```java
// 在 ArticleService 中添加 slug 生成逻辑
public Article createArticle(Article article, Long userId) {
    // 如果 slug 为空，根据标题生成
    if (article.getSlug() == null || article.getSlug().isEmpty()) {
        String slug = generateSlug(article.getTitle());
        article.setSlug(slug);
    }
    return articleMapper.insert(article);
}

private String generateSlug(String title) {
    // 将中文转换为拼音，或直接使用 ID
    // 简单方案：使用时间戳
    return System.currentTimeMillis() + "";
}
```

**解决方案 B: 手动更新数据库**

```sql
-- 为现有文章生成 slug
UPDATE article 
SET slug = CONCAT('article-', id) 
WHERE slug IS NULL OR slug = '';
```

### 4. 前端链接生成逻辑

**当前已修复的代码**:
```typescript
// page.tsx - 增加了 slug 验证
<Link
  href={article.slug ? `/article/${article.slug}` : '#'}
  onClick={(e) => {
    if (!article.slug) {
      e.preventDefault();
      alert('文章暂无详情页面');
    }
  }}
>
  阅读全文 →
</Link>
```

## 🔍 调试步骤

### 第一步：检查 API 数据
```bash
# 访问后端 API 查看文章数据
curl -X GET http://localhost:8080/api/articles?page=1&size=10
```

期望看到类似这样的数据：
```json
{
  "records": [
    {
      "id": 1,
      "title": "第一篇文章",
      "slug": "di-yi-pian-wen-zhang",  // ← 必须有这个字段
      "summary": "摘要...",
      "content": "内容...",
      ...
    }
  ]
}
```

### 第二步：检查前端控制台
1. 打开 http://localhost:3000
2. 按 F12 打开控制台
3. 查看打印的文章数据
4. 确认 `slug` 字段是否存在

### 第三步：测试文章详情
如果 slug 存在但仍然 404：
1. 停止 Next.js 开发服务器
2. 删除 `.next` 缓存目录
3. 重新启动：`npm run dev`

### 第四步：创建测试文章

通过管理后台创建一篇新文章：
1. 访问 http://localhost:5173
2. 点击"文章管理"
3. 点击"+ 新建文章"
4. 填写信息（**重要**：确保后端能生成 slug）
5. 保存后回到前台查看

## 💡 快速解决方案

### 方案 1: 修改后端自动生 成 slug（推荐）

在 `blog-api/blog-core/src/main/java/com/blog/core/service/impl/ArticleServiceImpl.java` 中添加：

```java
@Override
public Article createArticle(Article article, Long userId) {
    // 自动生成 slug
    if (StringUtils.isEmpty(article.getSlug())) {
        article.setSlug(generateSlugFromTitle(article.getTitle(), article.getId()));
    }
    article.setViewCount(0);
    article.setStatus(1); // 默认发布
    return baseMapper.insert(article);
}

private String generateSlugFromTitle(String title, Long id) {
    // 简单方案：使用 ID
    return "post-" + id;
    // 或者使用标题拼音（需要引入拼音库）
}
```

### 方案 2: 数据库批量更新

```sql
-- 连接数据库
mysql -u root -p your_database

-- 执行更新
UPDATE article SET slug = CONCAT('post-', id) WHERE slug IS NULL OR slug = '';
```

### 方案 3: 前端使用 ID 作为备用

修改前端代码，当 slug 不存在时使用 ID：

```typescript
// page.tsx
const articleUrl = article.slug 
  ? `/article/${article.slug}`
  : `/article/${article.id}`;

<Link href={articleUrl}>
  阅读全文 →
</Link>
```

同时修改详情页支持 ID 和 slug 两种参数：

```typescript
// article/[slug]/page.tsx
const params = useParams();
const identifier = params.slug as string; // 可能是 slug 或 ID

// API 需要同时支持 slug 和 ID 查询
const data = await articleApi.getByIdentifier(identifier);
```

## 📋 检查清单

- [ ] 后端 API 返回的文章数据包含 slug 字段
- [ ] slug 字段不为空且唯一
- [ ] 前端链接正确拼接 slug
- [ ] Next.js 开发服务器已重启
- [ ] 浏览器缓存已清除
- [ ] 控制台无 JavaScript 错误

## 🎯 临时测试方案

如果急需测试，可以：

1. **直接访问文章 ID**（需要修改后端支持）
   ```
   http://localhost:3000/article/1
   ```

2. **手动添加测试数据**
   ```sql
   INSERT INTO article (title, slug, content, summary, status, view_count, create_time)
   VALUES ('测试文章', 'test-article', '<p>这是测试内容</p>', '测试摘要', 1, 0, NOW());
   ```

3. **访问测试文章**
   ```
   http://localhost:3000/article/test-article
   ```

## 📞 需要更多信息？

请提供以下内容以便进一步诊断：
1. 浏览器控制台的完整错误信息
2. Network 面板中 `/api/articles` 的响应数据
3. 点击文章链接时的 URL 是什么
4. 数据库中 article 表的结构和数据样例

---

**状态**: 已添加调试日志和错误处理，请重启前端服务后再次测试

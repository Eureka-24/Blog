# 🔧 文章详情页 404 问题修复方案

## 问题分析

点击博客文章后显示 404，可能的原因：

1. **文章缺少 slug 字段** - 数据库中的文章记录没有 slug
2. **中文 slug 支持问题** - 后端生成的 slug 对中文标题处理不当
3. **Next.js 路由缓存** - 需要重启开发服务器

## ✅ 已完成的修复

### 1. 前端增加了 slug 验证
```typescript
// ✅ 已修复：首页链接生成
<Link href={article.slug ? `/article/${article.slug}` : '#'} 
      onClick={(e) => !article.slug && e.preventDefault()}>
  <h2>{article.title}</h2>
</Link>

// ✅ 已修复：详情页增加调试日志
console.log('Fetching article with slug:', slug);
console.log('Article data:', data);
```

### 2. 后端已有 slug 生成逻辑
```java
// blog-core/service/impl/ArticleServiceImpl.java
@Override
public Article createArticle(Article article, List<Long> tagIds) {
    if (!StringUtils.hasText(article.getSlug())) {
        article.setSlug(generateSlug(article.getTitle()));
    }
    save(article);
    // ...
}
```

## 🚀 立即执行的步骤

### 步骤 1: 检查现有文章的 slug

访问 API 查看数据：
```bash
# 浏览器访问
http://localhost:8080/api/articles?page=1&size=10

# 或使用 PowerShell
Invoke-RestMethod -Uri "http://localhost:8080/api/articles?page=1&size=10" | ConvertTo-Json
```

检查返回的 JSON 中每篇文章是否有 `slug` 字段。

### 步骤 2: 如果文章没有 slug，执行 SQL 更新

```sql
-- 连接 MySQL 数据库
mysql -u root -p

-- 选择数据库
USE your_blog_database;

-- 查看当前文章数据
SELECT id, title, slug FROM article;

-- 为没有 slug 的文章生成 slug（使用 ID）
UPDATE article 
SET slug = CONCAT('post-', id) 
WHERE slug IS NULL OR slug = '';

-- 验证更新结果
SELECT id, title, slug FROM article;
```

### 步骤 3: 重启 Next.js 开发服务器

```bash
# 停止当前运行的服务（按 Ctrl+C）

# 删除缓存
cd blog-web
rm -r .next

# 重新启动
npm run dev
```

### 步骤 4: 测试文章详情

1. 打开 http://localhost:3000
2. 按 F12 打开开发者工具
3. 点击一篇文章
4. 观察控制台输出：
   - 应该看到 `Fetching article with slug: xxx`
   - 应该看到文章数据
5. 检查是否成功跳转到详情页

## 🔍 如果仍然 404

### 方案 A: 优化后端 slug 生成（支持中文）

修改 `blog-api/blog-core/src/main/java/com/blog/core/service/impl/ArticleServiceImpl.java`:

```java
private String generateSlug(String title) {
    // 方案 1: 使用时间戳 + 随机数（最简单）
    return System.currentTimeMillis() + "-" + (int)(Math.random() * 1000);
    
    // 方案 2: 使用 ID（推荐）
    // 需要在保存后才能获取 ID，所以要修改 createArticle 方法
}

// 更好的方式：在 createArticle 中生成
@Override
@Transactional
public Article createArticle(Article article, List<Long> tagIds) {
    // 先保存获取 ID
    save(article);
    
    // 如果 slug 为空，使用 ID 生成
    if (!StringUtils.hasText(article.getSlug())) {
        article.setSlug("post-" + article.getId());
        updateById(article);
    }
    
    // 处理标签...
    return article;
}
```

### 方案 B: 前端同时支持 slug 和 ID

修改文件结构，使用文章 ID 作为路由参数：

1. **重命名路由文件夹**:
   ```
   src/app/article/[slug]/page.tsx
   ↓
   src/app/article/[id]/page.tsx
   ```

2. **修改首页链接**:
   ```typescript
   <Link href={`/article/${article.id}`}>
     {article.title}
   </Link>
   ```

3. **修改详情页获取数据**:
   ```typescript
   const params = useParams();
   const id = params.id as string;
   
   // 使用 ID 获取文章
   const data = await articleApi.getById(parseInt(id));
   ```

4. **添加 API 方法**:
   ```typescript
   // lib/api.ts
   export const articleApi = {
     getById: (id: number) => request<Article>(`/api/articles/${id}`),
     // ...其他方法
   };
   ```

## 📝 创建测试文章

### 方法 1: 通过管理后台创建

1. 访问 http://localhost:5173
2. 文章管理 → 新建文章
3. 填写信息:
   - 标题：`测试文章 123`
   - 摘要：`这是一篇测试文章`
   - 内容：`<p>这是正文内容...</p>`
4. 保存
5. 查看数据库确认 slug 已生成

### 方法 2: 直接插入数据库

```sql
INSERT INTO article (title, slug, summary, content, status, view_count, create_time, update_time)
VALUES (
  '测试文章',
  'ce-shi-wen-zhang',
  '这是一篇测试文章',
  '<p>这是文章内容...</p>',
  1,
  0,
  NOW(),
  NOW()
);
```

## 🎯 完整诊断流程

```
1. 检查 API 数据
   ↓
   有 slug → 继续下一步
   无 slug → 执行 SQL 更新
   
2. 重启 Next.js
   ↓
   删除.next 缓存
   重新启动 npm run dev
   
3. 浏览器测试
   ↓
   打开控制台
   点击文章
   查看日志
   
4. 分析错误
   ↓
   404 → 检查路由配置
   空白 → 检查 API 调用
   报错 → 查看错误信息
```

## 💡 快速验证脚本

创建一个测试页面来验证 API：

```typescript
// 临时测试：在 page.tsx 中添加
useEffect(() => {
  fetch('http://localhost:8080/api/articles?page=1&size=10')
    .then(res => res.json())
    .then(data => {
      console.log('API 返回的数据:', data);
      data.records.forEach((article: any) => {
        console.log(`文章 "${article.title}" - slug:`, article.slug);
      });
    })
    .catch(err => console.error('API 请求失败:', err));
}, []);
```

## ✅ 成功标志

完成修复后，应该能够：

- [ ] 在首页看到文章列表
- [ ] 每篇文章都有正确的 slug
- [ ] 点击文章标题能跳转到详情页
- [ ] 详情页正确显示文章内容
- [ ] 控制台没有错误信息

## 🆘 需要帮助？

请提供以下信息：

1. **API 返回的数据截图**
   - Network 面板中的 `/api/articles` 响应
   
2. **浏览器控制台输出**
   - 点击文章时的日志
   
3. **点击后的 URL**
   - 地址栏显示的完整 URL
   
4. **数据库中的数据**
   ```sql
   SELECT id, title, slug FROM article LIMIT 5;
   ```

---

**下一步**: 按照上述步骤逐一排查，通常能解决 99% 的 404 问题！

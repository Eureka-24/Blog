-- ============================================
-- 博客系统 - 文章 Slug 修复脚本
-- ============================================
-- 用途：为所有没有 slug 的文章生成 slug
-- 使用方法:
--   mysql -u root -p your_database < fix_article_slug.sql
-- ============================================

-- 1. 查看当前情况
SELECT '=== 修复前的数据 ===' AS info;
SELECT id, title, slug 
FROM article 
WHERE slug IS NULL OR slug = '' 
LIMIT 10;

-- 2. 统计需要更新的数量
SELECT CONCAT('需要更新的文章数量：', COUNT(*)) AS need_update
FROM article 
WHERE slug IS NULL OR slug = '';

-- 3. 执行更新（使用 post-{id} 格式）
UPDATE article 
SET slug = CONCAT('post-', id),
    update_time = NOW()
WHERE slug IS NULL OR slug = '';

-- 4. 验证更新结果
SELECT '=== 修复后的数据 ===' AS info;
SELECT id, title, slug 
FROM article 
ORDER BY id DESC 
LIMIT 10;

-- 5. 检查是否有重复的 slug
SELECT '=== 检查重复 slug ===' AS info;
SELECT slug, COUNT(*) as count
FROM article
GROUP BY slug
HAVING COUNT(*) > 1;

-- 6. 最终统计
SELECT '=== 最终统计 ===' AS info;
SELECT 
  COUNT(*) AS total_articles,
  COUNT(DISTINCT slug) AS unique_slugs,
  COUNT(CASE WHEN slug IS NULL OR slug = '' THEN 1 END) AS null_slugs
FROM article;

-- 完成提示
SELECT '✅ Slug 修复完成！' AS status;

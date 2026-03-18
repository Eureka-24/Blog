-- 为 comment 表添加 root_id 字段
-- root_id 用于标识根评论，同一篇文章下的所有相关评论（包括回复）都有相同的 root_id
-- 根评论的 root_id = id
-- 子评论（回复）的 root_id = 其根评论的 id

ALTER TABLE comment 
ADD COLUMN root_id BIGINT;

-- 更新现有数据，将根评论的 root_id 设为自己的 id
UPDATE comment 
SET root_id = id 
WHERE parent_id IS NULL;

-- 更新子评论的 root_id（如果有嵌套评论）
-- 这里需要根据实际情况处理，如果现有数据都是直接回复根评论，则：
UPDATE comment c1
SET root_id = (
    SELECT c2.id 
    FROM comment c2 
    WHERE c2.id = c1.parent_id
)
WHERE parent_id IS NOT NULL;

-- 添加索引优化查询性能
CREATE INDEX idx_comment_root_id ON comment(root_id);
CREATE INDEX idx_comment_article_root ON comment(article_id, root_id);

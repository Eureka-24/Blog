-- 初始化数据库脚本
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 分类表
CREATE TABLE IF NOT EXISTS category (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 标签表
CREATE TABLE IF NOT EXISTS tag (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    slug VARCHAR(50) NOT NULL UNIQUE,
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 文章表
CREATE TABLE IF NOT EXISTS article (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(200) NOT NULL UNIQUE,
    summary TEXT,
    content TEXT,
    cover_image VARCHAR(500),
    status INTEGER DEFAULT 0, -- 0:草稿 1:已发布
    view_count INTEGER DEFAULT 0,
    category_id BIGINT REFERENCES category(id),
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 文章标签关联表
CREATE TABLE IF NOT EXISTS article_tag (
    article_id BIGINT REFERENCES article(id) ON DELETE CASCADE,
    tag_id BIGINT REFERENCES tag(id) ON DELETE CASCADE,
    PRIMARY KEY (article_id, tag_id)
);

-- 评论表
CREATE TABLE IF NOT EXISTS comment (
    id BIGSERIAL PRIMARY KEY,
    article_id BIGINT REFERENCES article(id) ON DELETE CASCADE,
    parent_id BIGINT REFERENCES comment(id) ON DELETE CASCADE,
    author_name VARCHAR(100) NOT NULL,
    author_email VARCHAR(100),
    author_website VARCHAR(200),
    content TEXT NOT NULL,
    ip VARCHAR(50),
    user_agent TEXT,
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX idx_article_status ON article(status);
CREATE INDEX idx_article_category ON article(category_id);
CREATE INDEX idx_article_create_time ON article(create_time);
CREATE INDEX idx_comment_article ON comment(article_id);
CREATE INDEX idx_comment_parent ON comment(parent_id);

-- 插入默认数据
INSERT INTO category (name, slug, description, sort_order) VALUES
('技术', 'tech', '技术文章', 1),
('生活', 'life', '生活随笔', 2),
('随笔', 'notes', '随想杂记', 3)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO tag (name, slug) VALUES
('Java', 'java'),
('Spring Boot', 'spring-boot'),
('React', 'react'),
('Docker', 'docker')
ON CONFLICT (slug) DO NOTHING;

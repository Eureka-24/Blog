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

-- 用户表
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    nickname VARCHAR(50),
    avatar VARCHAR(500),
    role INTEGER DEFAULT 0, -- 0:普通用户 1:管理员
    status INTEGER DEFAULT 1, -- 0:禁用 1:正常
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 为评论表添加 root_id 字段
ALTER TABLE comment ADD COLUMN IF NOT EXISTS root_id BIGINT REFERENCES comment(id) ON DELETE CASCADE;

-- 创建索引
CREATE INDEX idx_article_status ON article(status);
CREATE INDEX idx_article_category ON article(category_id);
CREATE INDEX idx_article_create_time ON article(create_time);
CREATE INDEX idx_comment_article ON comment(article_id);
CREATE INDEX idx_comment_parent ON comment(parent_id);
CREATE INDEX idx_comment_root ON comment(root_id);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);

CREATE TABLE IF NOT EXISTS registration_codes (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(32) NOT NULL UNIQUE,
    type INTEGER NOT NULL DEFAULT 0,
    expire_time TIMESTAMP NOT NULL,
    is_used BOOLEAN NOT NULL DEFAULT FALSE,
    used_by BIGINT,
    used_time TIMESTAMP,
    create_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE registration_codes IS '注册码表';
COMMENT ON COLUMN registration_codes.code IS '注册码';
COMMENT ON COLUMN registration_codes.type IS '类型：0-普通用户码，1-管理员码';
COMMENT ON COLUMN registration_codes.expire_time IS '过期时间';
COMMENT ON COLUMN registration_codes.is_used IS '是否已使用';
COMMENT ON COLUMN registration_codes.used_by IS '使用用户ID';
COMMENT ON COLUMN registration_codes.used_time IS '使用时间';

CREATE INDEX IF NOT EXISTS idx_code ON registration_codes(code);
CREATE INDEX IF NOT EXISTS idx_expire_time ON registration_codes(expire_time);


-- 图片表
CREATE TABLE IF NOT EXISTS image (
    id BIGSERIAL PRIMARY KEY,
    article_id BIGINT REFERENCES article(id) ON DELETE CASCADE,
    original_name VARCHAR(255) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    thumbnail_path VARCHAR(500),
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    width INTEGER,
    height INTEGER,
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_image_article ON image(article_id);

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

-- 插入默认管理员账号 (密码：admin123)
INSERT INTO users (username, password, email, nickname, role) VALUES
('admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lqkkO9QS3TzCjH3rS', 'admin@example.com', '管理员', 1)
ON CONFLICT (username) DO NOTHING;

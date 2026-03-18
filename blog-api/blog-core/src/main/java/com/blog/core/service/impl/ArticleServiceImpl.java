package com.blog.core.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.blog.core.entity.Article;
import com.blog.core.entity.ArticleTag;
import com.blog.core.entity.Category;
import com.blog.core.entity.Tag;
import com.blog.core.mapper.ArticleMapper;
import com.blog.core.mapper.ArticleTagMapper;
import com.blog.core.service.ArticleService;
import com.blog.core.service.CategoryService;
import com.blog.core.service.TagService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ArticleServiceImpl extends ServiceImpl<ArticleMapper, Article> implements ArticleService {

    private final ArticleTagMapper articleTagMapper;
    private final TagService tagService;
    private final CategoryService categoryService;

    @Override
    public List<Article> list() {
        List<Article> articles = super.list();
        // 为每篇文章加载 category 和 tags
        for (Article article : articles) {
            loadArticleRelations(article);
        }
        return articles;
    }

    @Override
    public Page<Article> getPublishedArticles(int page, int size) {
        Page<Article> articlePage = baseMapper.selectPublishedArticles(new Page<>(page, size));
        // 为每篇文章加载 category 和 tags
        for (Article article : articlePage.getRecords()) {
            loadArticleRelations(article);
        }
        return articlePage;
    }

    @Override
    public Article getBySlug(String slug) {
        Article article = baseMapper.selectBySlug(slug);
        if (article != null) {
            loadArticleRelations(article);
        }
        return article;
    }

    /**
     * 加载文章的关联数据（分类和标签）
     */
    private void loadArticleRelations(Article article) {
        // 加载分类
        if (article.getCategoryId() != null) {
            Category category = categoryService.getById(article.getCategoryId());
            article.setCategory(category);
        }
        // 加载标签
        List<Tag> tags = tagService.getTagsByArticleId(article.getId());
        article.setTags(tags);
    }

    @Override
    public List<Article> getArticlesByTag(Long tagId) {
        List<Article> articles = baseMapper.selectByTagId(tagId);
        for (Article article : articles) {
            loadArticleRelations(article);
        }
        return articles;
    }

    @Override
    public List<Article> getArticlesByCategory(Long categoryId) {
        List<Article> articles = lambdaQuery()
                .eq(Article::getCategoryId, categoryId)
                .eq(Article::getStatus, 1)
                .orderByDesc(Article::getCreateTime)
                .list();
        for (Article article : articles) {
            loadArticleRelations(article);
        }
        return articles;
    }

    @Override
    public List<Article> getHotArticles(int limit) {
        List<Article> articles = baseMapper.selectHotArticles(limit);
        for (Article article : articles) {
            loadArticleRelations(article);
        }
        return articles;
    }

    @Override
    public void incrementViewCount(Long articleId) {
        lambdaUpdate()
                .setSql("view_count = view_count + 1")
                .eq(Article::getId, articleId)
                .update();
    }

    @Override
    @Transactional
    public Article createArticle(Article article, List<Long> tagIds) {
        // 如果 slug 为空，先生成一个临时 slug（使用时间戳）
        if (!StringUtils.hasText(article.getSlug())) {
            article.setSlug("post-" + System.currentTimeMillis());
        }
        
        // 保存文章
        save(article);
        
        // 处理标签
        if (tagIds != null && !tagIds.isEmpty()) {
            saveArticleTags(article.getId(), tagIds);
        }
        
        return article;
    }

    @Override
    @Transactional
    public Article updateArticle(Article article, List<Long> tagIds) {
        // 如果 slug 为空，生成一个临时 slug
        if (!StringUtils.hasText(article.getSlug())) {
            article.setSlug("post-" + System.currentTimeMillis());
        }
        
        // 更新文章
        updateById(article);
        
        // 删除旧标签关联
        articleTagMapper.delete(new LambdaQueryWrapper<ArticleTag>()
                .eq(ArticleTag::getArticleId, article.getId()));
        
        // 处理新标签
        if (tagIds != null && !tagIds.isEmpty()) {
            saveArticleTags(article.getId(), tagIds);
        }
        
        return article;
    }

    private void saveArticleTags(Long articleId, List<Long> tagIds) {
        List<ArticleTag> articleTags = tagIds.stream()
                .map(tagId -> {
                    ArticleTag at = new ArticleTag();
                    at.setArticleId(articleId);
                    at.setTagId(tagId);
                    return at;
                })
                .collect(Collectors.toList());
        
        articleTags.forEach(articleTagMapper::insert);
    }

    private String generateSlug(String title) {
        // 如果标题是中文或为空，使用时间戳 + 随机数
        if (title == null || title.trim().isEmpty() || !title.matches(".*[a-zA-Z].*")) {
            return "post-" + System.currentTimeMillis() + "-" + (int)(Math.random() * 1000);
        }
        
        // 英文标题正常处理
        return title.toLowerCase()
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-")
                .replaceAll("-+", "-");
    }
}

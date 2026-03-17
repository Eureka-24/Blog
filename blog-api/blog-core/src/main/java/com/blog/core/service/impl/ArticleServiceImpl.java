package com.blog.core.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.blog.core.entity.Article;
import com.blog.core.entity.ArticleTag;
import com.blog.core.entity.Tag;
import com.blog.core.mapper.ArticleMapper;
import com.blog.core.mapper.ArticleTagMapper;
import com.blog.core.service.ArticleService;
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

    @Override
    public Page<Article> getPublishedArticles(int page, int size) {
        return baseMapper.selectPublishedArticles(new Page<>(page, size));
    }

    @Override
    public Article getBySlug(String slug) {
        return baseMapper.selectBySlug(slug);
    }

    @Override
    public List<Article> getArticlesByTag(Long tagId) {
        return baseMapper.selectByTagId(tagId);
    }

    @Override
    public List<Article> getHotArticles(int limit) {
        return baseMapper.selectHotArticles(limit);
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
        if (!StringUtils.hasText(article.getSlug())) {
            article.setSlug(generateSlug(article.getTitle()));
        }
        save(article);
        
        if (tagIds != null && !tagIds.isEmpty()) {
            saveArticleTags(article.getId(), tagIds);
        }
        
        return article;
    }

    @Override
    @Transactional
    public Article updateArticle(Article article, List<Long> tagIds) {
        if (!StringUtils.hasText(article.getSlug())) {
            article.setSlug(generateSlug(article.getTitle()));
        }
        updateById(article);
        
        articleTagMapper.delete(new LambdaQueryWrapper<ArticleTag>()
                .eq(ArticleTag::getArticleId, article.getId()));
        
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
        return title.toLowerCase()
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-")
                .replaceAll("-+", "-");
    }
}

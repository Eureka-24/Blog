package com.blog.core.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.IService;
import com.blog.core.entity.Article;

import java.util.List;

public interface ArticleService extends IService<Article> {
    
    Page<Article> getPublishedArticles(int page, int size);
    
    Article getBySlug(String slug);
    
    List<Article> getArticlesByTag(Long tagId);
    
    List<Article> getArticlesByCategory(Long categoryId);
    
    List<Article> getHotArticles(int limit);
    
    void incrementViewCount(Long articleId);
    
    Article createArticle(Article article, List<Long> tagIds);
    
    Article updateArticle(Article article, List<Long> tagIds);
}

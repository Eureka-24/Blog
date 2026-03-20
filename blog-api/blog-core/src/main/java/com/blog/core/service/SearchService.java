package com.blog.core.service;

import com.blog.core.dto.SearchResult;
import com.blog.core.entity.Article;

/**
 * 搜索服务接口
 */
public interface SearchService {
    
    /**
     * 搜索文章
     * @param query 搜索关键词
     * @param page 页码（从1开始）
     * @param size 每页大小
     * @return 搜索结果
     */
    SearchResult search(String query, int page, int size);
    
    /**
     * 索引单篇文章
     * @param article 文章
     */
    void indexArticle(Article article);
    
    /**
     * 更新文章索引
     * @param article 文章
     */
    void updateArticleIndex(Article article);
    
    /**
     * 删除文章索引
     * @param articleId 文章ID
     */
    void deleteArticleIndex(Long articleId);
    
    /**
     * 重建所有文章索引
     * @return 索引的文章数量
     */
    int rebuildAllIndexes();
    
    /**
     * 初始化索引设置
     */
    void initIndexSettings();
}

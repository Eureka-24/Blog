package com.blog.core.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 搜索结果
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SearchResult {
    
    /**
     * 搜索结果列表
     */
    private List<SearchHit> hits;
    
    /**
     * 总命中数
     */
    private int totalHits;
    
    /**
     * 查询耗时（毫秒）
     */
    private long processingTimeMs;
    
    /**
     * 当前页码
     */
    private int page;
    
    /**
     * 每页大小
     */
    private int pageSize;
    
    /**
     * 单个搜索命中结果
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SearchHit {
        /**
         * 文章ID
         */
        private Long id;
        
        /**
         * 文章标题
         */
        private String title;
        
        /**
         * 文章摘要
         */
        private String summary;
        
        /**
         * 文章 slug
         */
        private String slug;
        
        /**
         * 封面图片
         */
        private String coverImage;
        
        /**
         * 分类名称
         */
        private String categoryName;
        
        /**
         * 浏览次数
         */
        private Integer viewCount;
        
        /**
         * 创建时间
         */
        private String createTime;
        
        /**
         * 高亮显示的标题片段
         */
        private String highlightedTitle;
        
        /**
         * 高亮显示的内容片段
         */
        private String highlightedContent;
    }
}

package com.blog.core.event;

import com.blog.core.entity.Article;
import com.blog.core.service.SearchService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

/**
 * 文章事件监听器 - 处理搜索索引同步
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class ArticleEventListener {

    private final SearchService searchService;

    @Async
    @EventListener
    public void handleArticleEvent(ArticleEvent event) {
        Article article = event.getArticle();
        
        try {
            switch (event.getEventType()) {
                case CREATED:
                    // 只有已发布的文章才索引
                    if (article.getStatus() != null && article.getStatus() == 1) {
                        searchService.indexArticle(article);
                        log.info("Indexed new article: {}", article.getId());
                    }
                    break;
                    
                case UPDATED:
                    // 更新索引（如果文章已发布）
                    if (article.getStatus() != null && article.getStatus() == 1) {
                        searchService.updateArticleIndex(article);
                        log.info("Updated article index: {}", article.getId());
                    } else {
                        // 如果文章未发布，删除索引
                        searchService.deleteArticleIndex(article.getId());
                        log.info("Removed article index (unpublished): {}", article.getId());
                    }
                    break;
                    
                case DELETED:
                    searchService.deleteArticleIndex(article.getId());
                    log.info("Deleted article index: {}", article.getId());
                    break;
            }
        } catch (Exception e) {
            log.error("Failed to sync article index for article: {}", article.getId(), e);
        }
    }
}

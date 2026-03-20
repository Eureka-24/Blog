package com.blog.core.event;

import com.blog.core.entity.Article;
import lombok.Getter;
import org.springframework.context.ApplicationEvent;

/**
 * 文章事件
 */
@Getter
public class ArticleEvent extends ApplicationEvent {
    
    private final Article article;
    private final EventType eventType;
    
    public ArticleEvent(Object source, Article article, EventType eventType) {
        super(source);
        this.article = article;
        this.eventType = eventType;
    }
    
    public enum EventType {
        CREATED,
        UPDATED,
        DELETED
    }
}

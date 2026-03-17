package com.blog.core.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.blog.core.entity.Tag;

import java.util.List;

public interface TagService extends IService<Tag> {
    
    List<Tag> getTagsByArticleId(Long articleId);
    
    List<Tag> getAllWithCount();
    
    Tag getOrCreateByName(String name);
}

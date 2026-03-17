package com.blog.core.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.blog.core.entity.Category;

import java.util.List;

public interface CategoryService extends IService<Category> {
    
    List<Category> getAllWithCount();
    
    Category getBySlug(String slug);
}

package com.blog.core.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.blog.core.entity.Category;
import com.blog.core.mapper.CategoryMapper;
import com.blog.core.service.CategoryService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategoryServiceImpl extends ServiceImpl<CategoryMapper, Category> implements CategoryService {

    @Override
    public List<Category> getAllWithCount() {
        return baseMapper.selectAllWithCount();
    }

    @Override
    public Category getBySlug(String slug) {
        return getOne(new LambdaQueryWrapper<Category>()
                .eq(Category::getSlug, slug));
    }
}

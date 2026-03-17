package com.blog.core.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.blog.core.entity.Category;
import org.apache.ibatis.annotations.Select;

import java.util.List;

public interface CategoryMapper extends BaseMapper<Category> {
    
    @Select("SELECT c.*, COUNT(a.id) as articleCount FROM category c " +
            "LEFT JOIN article a ON c.id = a.category_id AND a.status = 1 " +
            "GROUP BY c.id ORDER BY c.sort_order")
    List<Category> selectAllWithCount();
}

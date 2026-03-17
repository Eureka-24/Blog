package com.blog.core.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.blog.core.entity.Article;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

public interface ArticleMapper extends BaseMapper<Article> {
    
    @Select("SELECT a.*, c.name as categoryName FROM article a " +
            "LEFT JOIN category c ON a.category_id = c.id " +
            "WHERE a.status = 1 ORDER BY a.create_time DESC")
    Page<Article> selectPublishedArticles(Page<Article> page);
    
    @Select("SELECT a.*, c.name as categoryName FROM article a " +
            "LEFT JOIN category c ON a.category_id = c.id " +
            "WHERE a.slug = #{slug} AND a.status = 1")
    Article selectBySlug(@Param("slug") String slug);
    
    @Select("SELECT a.* FROM article a " +
            "INNER JOIN article_tag at ON a.id = at.article_id " +
            "WHERE at.tag_id = #{tagId} AND a.status = 1 " +
            "ORDER BY a.create_time DESC")
    List<Article> selectByTagId(@Param("tagId") Long tagId);
    
    @Select("SELECT * FROM article WHERE status = 1 ORDER BY view_count DESC LIMIT #{limit}")
    List<Article> selectHotArticles(@Param("limit") int limit);
}

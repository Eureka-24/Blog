package com.blog.core.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.blog.core.entity.Tag;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

public interface TagMapper extends BaseMapper<Tag> {
    
    @Select("SELECT t.* FROM tag t " +
            "INNER JOIN article_tag at ON t.id = at.tag_id " +
            "WHERE at.article_id = #{articleId}")
    List<Tag> selectByArticleId(@Param("articleId") Long articleId);
    
    @Select("SELECT t.*, COUNT(at.article_id) as articleCount FROM tag t " +
            "LEFT JOIN article_tag at ON t.id = at.tag_id " +
            "LEFT JOIN article a ON at.article_id = a.id AND a.status = 1 " +
            "GROUP BY t.id")
    List<Tag> selectAllWithCount();
}

package com.blog.core.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.blog.core.entity.Comment;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

public interface CommentMapper extends BaseMapper<Comment> {
    
    @Select("SELECT * FROM comment WHERE article_id = #{articleId} AND parent_id IS NULL " +
            "ORDER BY create_time DESC")
    List<Comment> selectRootComments(@Param("articleId") Long articleId);
    
    @Select("SELECT * FROM comment WHERE parent_id = #{parentId} ORDER BY create_time")
    List<Comment> selectChildren(@Param("parentId") Long parentId);
}

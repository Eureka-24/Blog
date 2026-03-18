package com.blog.core.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.blog.core.entity.Comment;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

public interface CommentMapper extends BaseMapper<Comment> {
    
    // 查询文章的所有评论（不分层级，按时间排序）
    @Select("SELECT * FROM comment WHERE article_id = #{articleId} ORDER BY create_time ASC")
    List<Comment> selectAllComments(@Param("articleId") Long articleId);
    
    // 查询根评论（没有父评论的）
    @Select("SELECT * FROM comment WHERE article_id = #{articleId} AND parent_id IS NULL " +
            "ORDER BY create_time DESC")
    List<Comment> selectRootComments(@Param("articleId") Long articleId);
    
    // 查询某个根评论下的所有回复（按时间排序）
    @Select("SELECT * FROM comment WHERE root_id = #{rootId} AND parent_id IS NOT NULL " +
            "ORDER BY create_time ASC")
    List<Comment> selectRepliesByRootId(@Param("rootId") Long rootId);
    
    // 查询直接回复某条评论的评论
    @Select("SELECT * FROM comment WHERE parent_id = #{parentId} ORDER BY create_time ASC")
    List<Comment> selectChildren(@Param("parentId") Long parentId);
}

package com.blog.core.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.IService;
import com.blog.core.dto.CommentDTO;
import com.blog.core.entity.Comment;

import java.util.List;

public interface CommentService extends IService<Comment> {
    
    /**
     * 分页获取所有评论（管理后台用）
     */
    Page<Comment> getCommentsPage(int page, int size);
    
    List<CommentDTO> getCommentsByArticleId(Long articleId);
    
    Comment addComment(Comment comment);
}

package com.blog.core.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.blog.core.dto.CommentDTO;
import com.blog.core.entity.Comment;

import java.util.List;

public interface CommentService extends IService<Comment> {
    
    List<CommentDTO> getCommentsByArticleId(Long articleId);
    
    Comment addComment(Comment comment);
}

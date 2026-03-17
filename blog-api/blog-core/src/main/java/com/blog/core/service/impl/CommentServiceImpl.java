package com.blog.core.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.blog.core.entity.Comment;
import com.blog.core.mapper.CommentMapper;
import com.blog.core.service.CommentService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CommentServiceImpl extends ServiceImpl<CommentMapper, Comment> implements CommentService {

    @Override
    public List<Comment> getCommentsByArticleId(Long articleId) {
        List<Comment> rootComments = baseMapper.selectRootComments(articleId);
        
        for (Comment root : rootComments) {
            List<Comment> children = baseMapper.selectChildren(root.getId());
            root.setChildren(children);
        }
        
        return rootComments;
    }

    @Override
    public Comment addComment(Comment comment) {
        save(comment);
        return comment;
    }
}

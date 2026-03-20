package com.blog.core.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.blog.core.dto.CommentDTO;
import com.blog.core.entity.Comment;
import com.blog.core.mapper.CommentMapper;
import com.blog.core.service.CommentService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CommentServiceImpl extends ServiceImpl<CommentMapper, Comment> implements CommentService {

    @Override
    public Page<Comment> getCommentsPage(int page, int size) {
        Page<Comment> commentPage = new Page<>(page, size);
        LambdaQueryWrapper<Comment> wrapper = new LambdaQueryWrapper<>();
        wrapper.orderByDesc(Comment::getCreateTime);
        page(commentPage, wrapper);
        return commentPage;
    }

    @Override
    public List<CommentDTO> getCommentsByArticleId(Long articleId) {
        // 一次性获取文章所有评论
        List<Comment> allComments = baseMapper.selectAllComments(articleId);

        // 构建根评论 DTO（只包含 parentId 为 null 的）
        List<CommentDTO> rootDTOs = allComments.stream()
            .filter(c -> c.getParentId() == null)
            .map(root -> {
                CommentDTO dto = toDTO(root);
                // 找该根评论下所有回复（parentId 非 null 且 rootId == root.getId）
                List<CommentDTO> replies = allComments.stream()
                    .filter(c -> c.getParentId() != null
                        && root.getId().equals(c.getRootId()))
                    .map(this::toDTO)
                    .collect(Collectors.toList());
                dto.setChildren(replies);
                return dto;
            })
            .collect(Collectors.toList());

        return rootDTOs;
    }

    /** 将 Comment 实体转为 DTO（不包含 children） */
    private CommentDTO toDTO(Comment c) {
        CommentDTO dto = new CommentDTO();
        dto.setId(c.getId());
        dto.setArticleId(c.getArticleId());
        dto.setParentId(c.getParentId());
        dto.setRootId(c.getRootId());
        dto.setAuthorName(c.getAuthorName());
        dto.setAuthorEmail(c.getAuthorEmail());
        dto.setAuthorWebsite(c.getAuthorWebsite());
        dto.setContent(c.getContent());
        dto.setIp(c.getIp());
        dto.setCreateTime(c.getCreateTime());
        return dto;
    }

    @Override
    public Comment addComment(Comment comment) {
        if (comment.getParentId() != null) {
            Comment parentComment = getById(comment.getParentId());
            if (parentComment != null) {
                Long parentRootId = parentComment.getRootId();
                comment.setRootId(parentRootId != null ? parentRootId : parentComment.getId());
            }
        }

        save(comment);

        if (comment.getParentId() == null) {
            comment.setRootId(comment.getId());
            updateById(comment);
        }

        return comment;
    }
}

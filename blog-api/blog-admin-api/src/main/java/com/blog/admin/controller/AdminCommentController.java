package com.blog.admin.controller;

import com.blog.core.dto.CommentDTO;
import com.blog.core.entity.Comment;
import com.blog.core.service.CommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/comments")
@RequiredArgsConstructor
@CrossOrigin
public class AdminCommentController {

    private final CommentService commentService;

    @GetMapping
    public ResponseEntity<List<Comment>> list() {
        return ResponseEntity.ok(commentService.list());
    }

    @GetMapping("/article/{articleId}")
    public ResponseEntity<List<CommentDTO>> getByArticle(@PathVariable Long articleId) {
        return ResponseEntity.ok(commentService.getCommentsByArticleId(articleId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        commentService.removeById(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<Comment> approve(@PathVariable Long id) {
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{parentId}/reply")
    public ResponseEntity<Comment> reply(@PathVariable Long parentId, @RequestBody Comment comment) {
        try {
            Comment parentComment = commentService.getById(parentId);
            if (parentComment == null) {
                return ResponseEntity.notFound().build();
            }
            comment.setParentId(parentId);
            comment.setArticleId(parentComment.getArticleId());
            // 使用 addComment 确保 rootId 正确设置
            Comment saved = commentService.addComment(comment);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}

package com.blog.admin.controller;

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
    public ResponseEntity<List<Comment>> getByArticle(@PathVariable Long articleId) {
        return ResponseEntity.ok(commentService.getCommentsByArticleId(articleId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        commentService.removeById(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<Comment> approve(@PathVariable Long id) {
        // TODO: 添加审核状态字段后实现
        return ResponseEntity.ok().build();
    }
}

package com.blog.web.controller;

import com.blog.core.entity.Comment;
import com.blog.core.service.CommentService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/comments")
@RequiredArgsConstructor
@CrossOrigin
public class CommentController {

    private final CommentService commentService;

    @GetMapping("/article/{articleId}")
    public ResponseEntity<List<Comment>> getByArticle(@PathVariable Long articleId) {
        return ResponseEntity.ok(commentService.getCommentsByArticleId(articleId));
    }

    @PostMapping
    public ResponseEntity<Comment> create(@RequestBody Comment comment, 
                                          HttpServletRequest request) {
        comment.setIp(getClientIp(request));
        comment.setUserAgent(request.getHeader("User-Agent"));
        return ResponseEntity.ok(commentService.addComment(comment));
    }

    private String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty()) {
            ip = request.getRemoteAddr();
        }
        return ip.split(",")[0].trim();
    }
}

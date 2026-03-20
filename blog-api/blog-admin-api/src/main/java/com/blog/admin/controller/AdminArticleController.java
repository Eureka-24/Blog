package com.blog.admin.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.blog.admin.dto.ArticleRequest;
import com.blog.core.dto.PageResponse;
import com.blog.core.entity.Article;
import com.blog.core.service.ArticleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/articles")
@RequiredArgsConstructor
@CrossOrigin
public class AdminArticleController {

    private final ArticleService articleService;

    @GetMapping
    public ResponseEntity<PageResponse<Article>> list(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Long tagId) {
        Page<Article> articlePage = articleService.getArticlesPage(page, size, categoryId, tagId);
        return ResponseEntity.ok(PageResponse.from(articlePage));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Article> getById(@PathVariable Long id) {
        Article article = articleService.getById(id);
        if (article == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(article);
    }

    @PostMapping
    public ResponseEntity<Article> create(@RequestBody ArticleRequest request) {
        return ResponseEntity.ok(articleService.createArticle(request.getArticle(), request.getTagIds()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Article> update(@PathVariable Long id, @RequestBody ArticleRequest request) {
        request.getArticle().setId(id);
        return ResponseEntity.ok(articleService.updateArticle(request.getArticle(), request.getTagIds()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        articleService.removeById(id);
        return ResponseEntity.ok().build();
    }
}

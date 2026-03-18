package com.blog.web.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.blog.core.entity.Article;
import com.blog.core.service.ArticleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/articles")
@RequiredArgsConstructor
@CrossOrigin
public class ArticleController {

    private final ArticleService articleService;

    @GetMapping
    public ResponseEntity<Page<Article>> list(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Long tagId) {
        // 如果有筛选条件，使用筛选方法
        if (tagId != null) {
            List<Article> articles = articleService.getArticlesByTag(tagId);
            Page<Article> result = new Page<>(page, size);
            result.setRecords(articles);
            result.setTotal(articles.size());
            return ResponseEntity.ok(result);
        }
        if (categoryId != null) {
            List<Article> articles = articleService.getArticlesByCategory(categoryId);
            Page<Article> result = new Page<>(page, size);
            result.setRecords(articles);
            result.setTotal(articles.size());
            return ResponseEntity.ok(result);
        }
        return ResponseEntity.ok(articleService.getPublishedArticles(page, size));
    }

    @GetMapping("/{slug}")
    public ResponseEntity<Article> getBySlug(@PathVariable String slug) {
        Article article = articleService.getBySlug(slug);
        if (article == null) {
            return ResponseEntity.notFound().build();
        }
        articleService.incrementViewCount(article.getId());
        return ResponseEntity.ok(article);
    }

    @GetMapping("/hot")
    public ResponseEntity<List<Article>> getHotArticles(
            @RequestParam(defaultValue = "5") int limit) {
        return ResponseEntity.ok(articleService.getHotArticles(limit));
    }

    @GetMapping("/tag/{tagId}")
    public ResponseEntity<List<Article>> getByTag(@PathVariable Long tagId) {
        return ResponseEntity.ok(articleService.getArticlesByTag(tagId));
    }
}

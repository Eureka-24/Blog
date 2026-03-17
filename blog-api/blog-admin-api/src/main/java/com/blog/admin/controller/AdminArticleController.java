package com.blog.admin.controller;

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
    public ResponseEntity<List<Article>> list() {
        return ResponseEntity.ok(articleService.list());
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
    public ResponseEntity<Article> create(@RequestBody Article article) {
        return ResponseEntity.ok(articleService.createArticle(article, null));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Article> update(@PathVariable Long id, @RequestBody Article article) {
        article.setId(id);
        return ResponseEntity.ok(articleService.updateArticle(article, null));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        articleService.removeById(id);
        return ResponseEntity.ok().build();
    }
}

package com.blog.web.controller;

import com.blog.core.entity.Category;
import com.blog.core.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
@CrossOrigin
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping
    public ResponseEntity<List<Category>> list() {
        return ResponseEntity.ok(categoryService.getAllWithCount());
    }

    @GetMapping("/{slug}")
    public ResponseEntity<Category> getBySlug(@PathVariable String slug) {
        Category category = categoryService.getBySlug(slug);
        if (category == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(category);
    }
}

package com.blog.admin.controller;

import com.blog.core.entity.Tag;
import com.blog.core.service.TagService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/tags")
@RequiredArgsConstructor
@CrossOrigin
public class AdminTagController {

    private final TagService tagService;

    @GetMapping
    public ResponseEntity<List<Tag>> list() {
        return ResponseEntity.ok(tagService.list());
    }

    @PostMapping
    public ResponseEntity<Tag> create(@RequestBody Tag tag) {
        tagService.save(tag);
        return ResponseEntity.ok(tag);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        tagService.removeById(id);
        return ResponseEntity.ok().build();
    }
}

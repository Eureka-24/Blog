package com.blog.web.controller;

import com.blog.core.entity.Tag;
import com.blog.core.service.TagService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tags")
@RequiredArgsConstructor
@CrossOrigin
public class TagController {

    private final TagService tagService;

    @GetMapping
    public ResponseEntity<List<Tag>> list() {
        return ResponseEntity.ok(tagService.getAllWithCount());
    }
}

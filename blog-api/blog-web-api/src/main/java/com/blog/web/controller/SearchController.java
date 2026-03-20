package com.blog.web.controller;

import com.blog.core.dto.SearchResult;
import com.blog.core.service.SearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * 搜索控制器
 */
@RestController
@RequestMapping("/api/search")
@RequiredArgsConstructor
@CrossOrigin
public class SearchController {

    private final SearchService searchService;

    /**
     * 搜索文章
     * @param query 搜索关键词
     * @param page 页码（从1开始）
     * @param size 每页大小
     */
    @GetMapping
    public ResponseEntity<SearchResult> search(
            @RequestParam String query,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        if (query == null || query.trim().isEmpty()) {
            return ResponseEntity.ok(SearchResult.builder()
                    .hits(java.util.Collections.emptyList())
                    .totalHits(0)
                    .page(page)
                    .pageSize(size)
                    .build());
        }
        
        SearchResult result = searchService.search(query.trim(), page, size);
        return ResponseEntity.ok(result);
    }
}

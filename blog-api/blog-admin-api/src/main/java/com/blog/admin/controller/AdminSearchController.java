package com.blog.admin.controller;

import com.blog.core.service.SearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * 搜索索引管理控制器
 */
@RestController
@RequestMapping("/api/admin/search")
@RequiredArgsConstructor
@CrossOrigin
public class AdminSearchController {

    private final SearchService searchService;

    /**
     * 重建所有文章索引
     */
    @PostMapping("/rebuild-index")
    public ResponseEntity<Map<String, Object>> rebuildIndex() {
        int count = searchService.rebuildAllIndexes();
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("indexedCount", count);
        result.put("message", "成功重建 " + count + " 篇文章的索引");
        return ResponseEntity.ok(result);
    }

    /**
     * 初始化索引设置
     */
    @PostMapping("/init-settings")
    public ResponseEntity<Map<String, Object>> initSettings() {
        searchService.initIndexSettings();
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("message", "索引设置初始化成功");
        return ResponseEntity.ok(result);
    }
}

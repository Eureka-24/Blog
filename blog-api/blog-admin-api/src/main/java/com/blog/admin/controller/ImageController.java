package com.blog.admin.controller;

import com.blog.core.entity.Image;
import com.blog.core.service.ImageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/admin/images")
@RequiredArgsConstructor
@CrossOrigin
public class ImageController {

    private final ImageService imageService;

    /**
     * 上传图片
     */
    @PostMapping("/upload")
    public ResponseEntity<?> uploadImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "articleId", required = false) Long articleId) {
        try {
            Image image = imageService.uploadImage(file, articleId);
            Map<String, Object> result = new HashMap<>();
            result.put("id", image.getId());
            result.put("originalName", image.getOriginalName());
            result.put("fileName", image.getFileName());
            result.put("url", imageService.getImageUrl(image.getId()));
            result.put("thumbnailUrl", imageService.getThumbnailUrl(image.getId()));
            result.put("width", image.getWidth());
            result.put("height", image.getHeight());
            result.put("fileSize", image.getFileSize());
            result.put("createTime", image.getCreateTime());
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException e) {
            log.warn("图片上传参数错误: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (IOException e) {
            log.error("图片上传失败", e);
            return ResponseEntity.internalServerError().body(Map.of("error", "图片上传失败: " + e.getMessage()));
        }
    }

    /**
     * 获取文章图片列表
     */
    @GetMapping
    public ResponseEntity<List<Image>> getImagesByArticleId(
            @RequestParam(value = "articleId", required = false) Long articleId) {
        List<Image> images;
        if (articleId != null) {
            images = imageService.getImagesByArticleId(articleId);
        } else {
            // 如果没有指定 articleId，返回空列表
            images = List.of();
        }
        return ResponseEntity.ok(images);
    }

    /**
     * 根据ID获取图片
     */
    @GetMapping("/{id}")
    public ResponseEntity<Image> getImageById(@PathVariable Long id) {
        Image image = imageService.getById(id);
        if (image == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(image);
    }

    /**
     * 获取图片URL
     */
    @GetMapping("/{id}/url")
    public ResponseEntity<Map<String, String>> getImageUrl(@PathVariable Long id) {
        String url = imageService.getImageUrl(id);
        if (url == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(Map.of("url", url));
    }

    /**
     * 获取缩略图URL
     */
    @GetMapping("/{id}/thumbnail")
    public ResponseEntity<Map<String, String>> getThumbnailUrl(@PathVariable Long id) {
        String url = imageService.getThumbnailUrl(id);
        if (url == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(Map.of("url", url));
    }

    /**
     * 删除图片
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteImage(@PathVariable Long id) {
        boolean success = imageService.deleteImage(id);
        if (success) {
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}

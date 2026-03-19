package com.blog.core.service;

import com.blog.core.entity.Image;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

public interface ImageService {
    
    /**
     * 上传图片
     * @param file 图片文件
     * @param articleId 关联的文章ID（可选）
     * @return 图片实体
     */
    Image uploadImage(MultipartFile file, Long articleId) throws IOException;
    
    /**
     * 根据文章ID获取图片列表
     * @param articleId 文章ID
     * @return 图片列表
     */
    List<Image> getImagesByArticleId(Long articleId);
    
    /**
     * 根据ID获取图片
     * @param id 图片ID
     * @return 图片实体
     */
    Image getById(Long id);
    
    /**
     * 删除图片
     * @param id 图片ID
     * @return 是否成功
     */
    boolean deleteImage(Long id);
    
    /**
     * 获取图片访问URL
     * @param id 图片ID
     * @return 图片URL
     */
    String getImageUrl(Long id);
    
    /**
     * 获取缩略图URL
     * @param id 图片ID
     * @return 缩略图URL
     */
    String getThumbnailUrl(Long id);
}

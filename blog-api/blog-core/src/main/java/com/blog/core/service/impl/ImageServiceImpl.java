package com.blog.core.service.impl;

import com.blog.core.entity.Image;
import com.blog.core.mapper.ImageMapper;
import com.blog.core.service.ImageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.coobird.thumbnailator.Thumbnails;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ImageServiceImpl implements ImageService {

    private final ImageMapper imageMapper;

    @Value("${app.upload.path:/uploads/images}")
    private String uploadPath;

    @Value("${app.upload.thumbnail.width:300}")
    private int thumbnailWidth;

    @Value("${app.upload.thumbnail.height:200}")
    private int thumbnailHeight;

    private static final Set<String> ALLOWED_TYPES = Set.of(
            "image/jpeg", "image/png", "image/gif", "image/webp"
    );

    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

    @Override
    public Image uploadImage(MultipartFile file, Long articleId) throws IOException {
        // 验证文件
        validateFile(file);

        // 生成唯一文件名
        String originalName = file.getOriginalFilename();
        String extension = getFileExtension(originalName);
        String fileName = UUID.randomUUID().toString() + "." + extension;

        // 构建存储路径（绝对路径用于存储文件）
        String articleDir = articleId != null ? articleId.toString() : "temp";
        Path articlePath = Paths.get(uploadPath, articleDir);
        Path thumbnailPath = Paths.get(uploadPath, articleDir, "thumbs");

        // 创建目录
        Files.createDirectories(articlePath);
        Files.createDirectories(thumbnailPath);

        // 保存原图
        Path filePath = articlePath.resolve(fileName);
        file.transferTo(filePath.toFile());

        // 获取图片尺寸
        BufferedImage bufferedImage = ImageIO.read(filePath.toFile());
        int width = bufferedImage.getWidth();
        int height = bufferedImage.getHeight();

        // 生成缩略图
        String thumbnailFileName = "thumb_" + fileName;
        Path thumbnailFilePath = thumbnailPath.resolve(thumbnailFileName);
        generateThumbnail(filePath.toFile(), thumbnailFilePath.toFile());

        // 构建相对URL路径（用于访问）
        String relativePath = "/uploads/images/" + articleDir + "/" + fileName;
        String thumbnailRelativePath = "/uploads/images/" + articleDir + "/thumbs/" + thumbnailFileName;

        // 保存到数据库
        Image image = new Image();
        image.setArticleId(articleId);
        image.setOriginalName(originalName);
        image.setFileName(fileName);
        image.setFilePath(relativePath);
        image.setThumbnailPath(thumbnailRelativePath);
        image.setFileSize(file.getSize());
        image.setMimeType(file.getContentType());
        image.setWidth(width);
        image.setHeight(height);

        imageMapper.insert(image);

        log.info("图片上传成功: {}, articleId: {}", fileName, articleId);
        return image;
    }

    @Override
    public List<Image> getImagesByArticleId(Long articleId) {
        return imageMapper.selectByArticleId(articleId);
    }

    @Override
    public Image getById(Long id) {
        return imageMapper.selectById(id);
    }

    @Override
    public boolean deleteImage(Long id) {
        Image image = imageMapper.selectById(id);
        if (image == null) {
            return false;
        }

        try {
            // 删除原图文件（将相对路径转换为绝对路径）
            String relativePath = image.getFilePath();
            String fileName = Paths.get(relativePath).getFileName().toString();
            String articleDir = image.getArticleId() != null ? image.getArticleId().toString() : "temp";
            Path filePath = Paths.get(uploadPath, articleDir, fileName);
            Files.deleteIfExists(filePath);

            // 删除缩略图文件
            if (image.getThumbnailPath() != null) {
                String thumbFileName = Paths.get(image.getThumbnailPath()).getFileName().toString();
                Path thumbPath = Paths.get(uploadPath, articleDir, "thumbs", thumbFileName);
                Files.deleteIfExists(thumbPath);
            }

            // 删除数据库记录
            imageMapper.deleteById(id);

            log.info("图片删除成功: {}", id);
            return true;
        } catch (IOException e) {
            log.error("删除图片文件失败: {}", id, e);
            return false;
        }
    }

    @Override
    public String getImageUrl(Long id) {
        Image image = imageMapper.selectById(id);
        if (image == null) {
            return null;
        }
        return buildUrl(image.getFilePath());
    }

    @Override
    public String getThumbnailUrl(Long id) {
        Image image = imageMapper.selectById(id);
        if (image == null || image.getThumbnailPath() == null) {
            return null;
        }
        return buildUrl(image.getThumbnailPath());
    }

    private void validateFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("文件不能为空");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("文件大小超过5MB限制");
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_TYPES.contains(contentType.toLowerCase())) {
            throw new IllegalArgumentException("不支持的文件类型，仅支持 JPG/PNG/GIF/WebP");
        }
    }

    private String getFileExtension(String filename) {
        if (filename == null || filename.lastIndexOf(".") == -1) {
            return "jpg";
        }
        return filename.substring(filename.lastIndexOf(".") + 1).toLowerCase();
    }

    private void generateThumbnail(File source, File dest) throws IOException {
        Thumbnails.of(source)
                .size(thumbnailWidth, thumbnailHeight)
                .keepAspectRatio(true)
                .toFile(dest);
    }

    private String buildUrl(String filePath) {
        // 数据库中存储的已经是相对URL路径，直接返回
        // 例如: /uploads/images/123/uuid.jpg
        return filePath;
    }
}

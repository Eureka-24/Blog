package com.blog.core.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("image")
public class Image {
    
    @TableId(type = IdType.AUTO)
    private Long id;
    
    private Long articleId;
    
    private String originalName;
    
    private String fileName;
    
    private String filePath;
    
    private String thumbnailPath;
    
    private Long fileSize;
    
    private String mimeType;
    
    private Integer width;
    
    private Integer height;
    
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
}

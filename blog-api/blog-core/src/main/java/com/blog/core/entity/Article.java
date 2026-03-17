package com.blog.core.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@TableName("article")
public class Article {
    
    @TableId(type = IdType.AUTO)
    private Long id;
    
    private String title;
    
    private String slug;
    
    private String summary;
    
    private String content;
    
    private String coverImage;
    
    private Integer status;
    
    private Integer viewCount;
    
    private Long categoryId;
    
    @TableField(exist = false)
    private Category category;
    
    @TableField(exist = false)
    private List<Tag> tags;
    
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
    
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
}

package com.blog.core.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@TableName("comment")
public class Comment {
    
    @TableId(type = IdType.AUTO)
    private Long id;
    
    private Long articleId;
    
    private Long parentId;
    
    private String authorName;
    
    private String authorEmail;
    
    private String authorWebsite;
    
    private String content;
    
    private String ip;
    
    private String userAgent;
    
    @TableField(exist = false)
    private List<Comment> children;
    
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
}

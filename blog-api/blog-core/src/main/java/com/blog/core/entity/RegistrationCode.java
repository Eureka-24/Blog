package com.blog.core.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("registration_codes")
public class RegistrationCode {
    
    @TableId(type = IdType.AUTO)
    private Long id;
    
    private String code;
    
    private Integer type; // 0:普通用户码 1:管理员码
    
    private LocalDateTime expireTime;
    
    private Boolean isUsed;
    
    private Long usedBy;
    
    private LocalDateTime usedTime;
    
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
    
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
}

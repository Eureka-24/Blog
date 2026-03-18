package com.blog.core.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
public class CommentDTO {

    private Long id;
    private Long articleId;
    private Long parentId;
    private Long rootId;
    private String authorName;
    private String authorEmail;
    private String authorWebsite;
    private String content;
    private String ip;
    private LocalDateTime createTime;

    private List<CommentDTO> children = new ArrayList<>();
}

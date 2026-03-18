package com.blog.admin.dto;

import com.blog.core.entity.Article;
import lombok.Data;

import java.util.List;

@Data
public class ArticleRequest {
    private Article article;
    private List<Long> tagIds;
}

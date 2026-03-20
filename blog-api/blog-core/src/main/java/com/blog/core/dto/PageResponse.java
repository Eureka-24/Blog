package com.blog.core.dto;

import lombok.Data;

import java.util.List;

/**
 * 通用分页响应类
 */
@Data
public class PageResponse<T> {
    private List<T> records;
    private long total;
    private long size;
    private long current;
    private long pages;

    public PageResponse() {
    }

    public PageResponse(List<T> records, long total, long size, long current) {
        this.records = records;
        this.total = total;
        this.size = size;
        this.current = current;
        this.pages = size > 0 ? (total + size - 1) / size : 0;
    }

    /**
     * 从 MyBatis-Plus Page 对象转换
     */
    public static <T> PageResponse<T> from(com.baomidou.mybatisplus.extension.plugins.pagination.Page<T> page) {
        PageResponse<T> response = new PageResponse<>();
        response.setRecords(page.getRecords());
        response.setTotal(page.getTotal());
        response.setSize(page.getSize());
        response.setCurrent(page.getCurrent());
        response.setPages(page.getPages());
        return response;
    }
}

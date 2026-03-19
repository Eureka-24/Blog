package com.blog.common.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Value("${app.upload.path:/uploads/images}")
    private String uploadPath;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // 映射上传的文件路径到URL
        // uploadPath = /uploads/images，文件存储在此目录下
        // 将 /uploads/images/** 映射到文件系统的 uploadPath 目录
        // 这样请求 /uploads/images/1/xxx.jpg 会正确映射到 file:/uploads/images/1/xxx.jpg
        registry.addResourceHandler("/uploads/images/**")
                .addResourceLocations("file:" + uploadPath + "/");
    }
}

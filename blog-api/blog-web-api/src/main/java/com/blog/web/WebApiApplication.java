package com.blog.web;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(scanBasePackages = "com.blog")
@MapperScan("com.blog.core.mapper")
public class WebApiApplication {
    
    public static void main(String[] args) {
        SpringApplication.run(WebApiApplication.class, args);
    }
}

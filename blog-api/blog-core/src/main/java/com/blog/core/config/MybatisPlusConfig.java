package com.blog.core.config;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.context.annotation.Configuration;

/**
 * MyBatis-Plus configuration
 */
@Configuration
@MapperScan("com.blog.core.mapper")
public class MybatisPlusConfig {
    
}

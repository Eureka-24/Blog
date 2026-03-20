package com.blog.core.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * JWT 配置类
 */
@Data
@Configuration
@ConfigurationProperties(prefix = "jwt")
public class JwtConfig {

    /**
     * JWT 密钥
     */
    private String secret;

    /**
     * Token 过期时间（毫秒）
     */
    private long expiration = 2592000000L; // 默认30天
}

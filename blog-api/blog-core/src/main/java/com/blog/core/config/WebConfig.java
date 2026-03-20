package com.blog.core.config;

import com.blog.core.interceptor.JwtAuthenticationInterceptor;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Web 配置类
 */
@Configuration
@RequiredArgsConstructor
public class WebConfig implements WebMvcConfigurer {

    private final JwtAuthenticationInterceptor jwtAuthenticationInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(jwtAuthenticationInterceptor)
                // 拦截所有请求
                .addPathPatterns("/**")
                // 排除登录相关的接口
                .excludePathPatterns(
                        "/api/auth/login",
                        "/api/auth/register",
                        "/api/articles/**",
                        "/api/categories/**",
                        "/api/tags/**",
                        "/api/comments/**",
                        "/api/search/**",
                        "/uploads/**",
                        "/error"
                );
    }
}

package com.blog.core.interceptor;

import com.blog.core.service.JwtTokenProvider;
import com.blog.core.service.RedisTokenService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

/**
 * JWT 认证拦截器
 * 验证请求中的Token有效性
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationInterceptor implements HandlerInterceptor {

    private final JwtTokenProvider jwtTokenProvider;
    private final RedisTokenService redisTokenService;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        // 获取请求路径
        String requestUri = request.getRequestURI();
        String method = request.getMethod();
        
        // 对于OPTIONS请求（预检请求），直接放行
        if ("OPTIONS".equalsIgnoreCase(method)) {
            return true;
        }
        
        // 获取Authorization头
        String authHeader = request.getHeader("Authorization");
        
        if (authHeader == null || authHeader.isEmpty()) {
            log.warn("请求 {} 缺少Authorization头", requestUri);
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("{\"error\":\"Unauthorized\",\"message\":\"Missing token\"}");
            return false;
        }
        
        String token = authHeader;
        
        // 1. 验证JWT格式和签名
        if (!jwtTokenProvider.validateToken(token)) {
            log.warn("请求 {} 的Token验证失败", requestUri);
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("{\"error\":\"Unauthorized\",\"message\":\"Invalid or expired token\"}");
            return false;
        }
        
        // 2. 从Token解析用户ID
        Long userId = jwtTokenProvider.getUserIdFromToken(token);
        if (userId == null) {
            log.warn("请求 {} 无法从Token解析用户ID", requestUri);
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("{\"error\":\"Unauthorized\",\"message\":\"Invalid token\"}");
            return false;
        }
        
        // 3. 检查Token是否在黑名单中
        if (redisTokenService.isBlacklisted(token)) {
            log.warn("请求 {} 的Token已在黑名单中", requestUri);
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("{\"error\":\"Unauthorized\",\"message\":\"Token has been revoked\"}");
            return false;
        }
        
        // 4. 验证Redis中的Token（单设备登录检查）
        if (!redisTokenService.validateToken(userId, token)) {
            log.warn("请求 {} 的Redis Token验证失败，用户 {} 可能已在其他设备登录", requestUri, userId);
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("{\"error\":\"Unauthorized\",\"message\":\"Token expired or logged in from another device\"}");
            return false;
        }
        
        // 5. 自动续期Token（每次请求延长30天）
        redisTokenService.extendTokenTTL(userId, 2592000000L);
        
        // 将用户信息存入request属性，供后续使用
        request.setAttribute("userId", userId);
        request.setAttribute("username", jwtTokenProvider.getUsernameFromToken(token));
        request.setAttribute("role", jwtTokenProvider.getRoleFromToken(token));
        
        log.debug("请求 {} Token验证通过，用户ID: {}", requestUri, userId);
        return true;
    }
}

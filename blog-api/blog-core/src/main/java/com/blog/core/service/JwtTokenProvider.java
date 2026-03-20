package com.blog.core.service;

import com.blog.core.config.JwtConfig;
import com.blog.core.entity.User;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

/**
 * JWT Token 提供者
 * 负责JWT的生成、解析和验证
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class JwtTokenProvider {

    private final JwtConfig jwtConfig;

    private SecretKey secretKey;

    @PostConstruct
    public void init() {
        // 使用配置的密钥初始化SecretKey
        this.secretKey = Keys.hmacShaKeyFor(jwtConfig.getSecret().getBytes(StandardCharsets.UTF_8));
    }

    /**
     * 生成JWT Token
     *
     * @param user 用户信息
     * @return JWT Token
     */
    public String generateToken(User user) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtConfig.getExpiration());

        // 构建payload中的自定义声明
        Map<String, Object> claims = new HashMap<>();
        claims.put("username", user.getUsername());
        claims.put("role", user.getRole());
        claims.put("nickname", user.getNickname());

        return Jwts.builder()
                .subject(String.valueOf(user.getId()))
                .claims(claims)
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(secretKey, Jwts.SIG.HS256)
                .compact();
    }

    /**
     * 从Token中解析用户ID
     *
     * @param token JWT Token
     * @return 用户ID
     */
    public Long getUserIdFromToken(String token) {
        try {
            Claims claims = parseToken(token);
            return Long.valueOf(claims.getSubject());
        } catch (Exception e) {
            log.error("从Token解析用户ID失败: {}", e.getMessage());
            return null;
        }
    }

    /**
     * 从Token中解析用户名
     *
     * @param token JWT Token
     * @return 用户名
     */
    public String getUsernameFromToken(String token) {
        try {
            Claims claims = parseToken(token);
            return claims.get("username", String.class);
        } catch (Exception e) {
            log.error("从Token解析用户名失败: {}", e.getMessage());
            return null;
        }
    }

    /**
     * 从Token中解析用户角色
     *
     * @param token JWT Token
     * @return 角色
     */
    public Integer getRoleFromToken(String token) {
        try {
            Claims claims = parseToken(token);
            return claims.get("role", Integer.class);
        } catch (Exception e) {
            log.error("从Token解析角色失败: {}", e.getMessage());
            return null;
        }
    }

    /**
     * 验证Token是否有效
     *
     * @param token JWT Token
     * @return 是否有效
     */
    public boolean validateToken(String token) {
        try {
            parseToken(token);
            return true;
        } catch (ExpiredJwtException e) {
            log.warn("JWT Token已过期");
            return false;
        } catch (UnsupportedJwtException e) {
            log.warn("不支持的JWT Token");
            return false;
        } catch (MalformedJwtException e) {
            log.warn("JWT Token格式错误");
            return false;
        } catch (SignatureException e) {
            log.warn("JWT Token签名验证失败");
            return false;
        } catch (IllegalArgumentException e) {
            log.warn("JWT Token为空或非法");
            return false;
        }
    }

    /**
     * 获取Token过期时间
     *
     * @param token JWT Token
     * @return 过期时间
     */
    public Date getExpirationDateFromToken(String token) {
        try {
            Claims claims = parseToken(token);
            return claims.getExpiration();
        } catch (Exception e) {
            log.error("获取Token过期时间失败: {}", e.getMessage());
            return null;
        }
    }

    /**
     * 检查Token是否即将过期（剩余时间少于指定天数）
     *
     * @param token     JWT Token
     * @param daysLeft  剩余天数阈值
     * @return 是否即将过期
     */
    public boolean isTokenExpiringSoon(String token, int daysLeft) {
        try {
            Date expiration = getExpirationDateFromToken(token);
            if (expiration == null) {
                return false;
            }
            long diff = expiration.getTime() - System.currentTimeMillis();
            long daysInMillis = daysLeft * 24 * 60 * 60 * 1000L;
            return diff < daysInMillis;
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * 解析Token获取Claims
     *
     * @param token JWT Token
     * @return Claims
     */
    private Claims parseToken(String token) {
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}

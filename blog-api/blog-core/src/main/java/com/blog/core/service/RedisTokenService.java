package com.blog.core.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

/**
 * Redis Token 服务
 * 管理用户Token的存储、验证、过期和黑名单
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class RedisTokenService {

    private final StringRedisTemplate redisTemplate;

    // Token key前缀
    private static final String TOKEN_KEY_PREFIX = "blog:token:";
    // Token黑名单key前缀
    private static final String BLACKLIST_KEY_PREFIX = "blog:token:blacklist:";

    /**
     * 保存用户Token（单设备登录，会踢掉旧Token）
     *
     * @param userId 用户ID
     * @param token  JWT Token
     * @param ttl    过期时间（毫秒）
     */
    public void saveToken(Long userId, String token, long ttl) {
        String key = TOKEN_KEY_PREFIX + userId;
        // 先检查是否有旧Token，如果有则加入黑名单
        String oldToken = redisTemplate.opsForValue().get(key);
        if (oldToken != null && !oldToken.equals(token)) {
            // 将旧Token加入黑名单，保留原Token的剩余有效期
            Long oldTtl = redisTemplate.getExpire(key, TimeUnit.MILLISECONDS);
            if (oldTtl != null && oldTtl > 0) {
                addToBlacklist(oldToken, oldTtl);
                log.info("用户 {} 的旧Token已被加入黑名单", userId);
            }
        }
        // 保存新Token
        redisTemplate.opsForValue().set(key, token, ttl, TimeUnit.MILLISECONDS);
        log.info("用户 {} 的Token已保存到Redis，过期时间: {} 天", userId, ttl / (1000 * 60 * 60 * 24));
    }

    /**
     * 获取用户Token
     *
     * @param userId 用户ID
     * @return Token
     */
    public String getToken(Long userId) {
        String key = TOKEN_KEY_PREFIX + userId;
        return redisTemplate.opsForValue().get(key);
    }

    /**
     * 验证Token是否有效（存在于Redis且不在黑名单）
     *
     * @param userId 用户ID
     * @param token  JWT Token
     * @return 是否有效
     */
    public boolean validateToken(Long userId, String token) {
        // 1. 检查是否在黑名单
        if (isBlacklisted(token)) {
            log.warn("Token已在黑名单中");
            return false;
        }
        // 2. 检查Redis中是否存在且匹配
        String storedToken = getToken(userId);
        if (storedToken == null) {
            log.warn("Redis中不存在用户 {} 的Token", userId);
            return false;
        }
        boolean valid = storedToken.equals(token);
        if (!valid) {
            log.warn("Token不匹配，用户 {} 可能已在其他设备登录", userId);
        }
        return valid;
    }

    /**
     * 延长Token有效期（自动续期）
     *
     * @param userId 用户ID
     * @param ttl    新的过期时间（毫秒）
     */
    public void extendTokenTTL(Long userId, long ttl) {
        String key = TOKEN_KEY_PREFIX + userId;
        Boolean exists = redisTemplate.hasKey(key);
        if (Boolean.TRUE.equals(exists)) {
            redisTemplate.expire(key, ttl, TimeUnit.MILLISECONDS);
            log.debug("用户 {} 的Token有效期已延长至 {} 天", userId, ttl / (1000 * 60 * 60 * 24));
        }
    }

    /**
     * 删除用户Token（登出）
     *
     * @param userId 用户ID
     */
    public void deleteToken(Long userId) {
        String key = TOKEN_KEY_PREFIX + userId;
        String token = redisTemplate.opsForValue().get(key);
        if (token != null) {
            // 获取剩余有效期，将Token加入黑名单
            Long ttl = redisTemplate.getExpire(key, TimeUnit.MILLISECONDS);
            if (ttl != null && ttl > 0) {
                addToBlacklist(token, ttl);
            }
            redisTemplate.delete(key);
            log.info("用户 {} 的Token已从Redis删除", userId);
        }
    }

    /**
     * 将Token加入黑名单
     *
     * @param token Token
     * @param ttl   黑名单保留时间（毫秒）
     */
    public void addToBlacklist(String token, long ttl) {
        String key = BLACKLIST_KEY_PREFIX + token;
        redisTemplate.opsForValue().set(key, "logout", ttl, TimeUnit.MILLISECONDS);
        log.debug("Token已加入黑名单，保留时间: {} 毫秒", ttl);
    }

    /**
     * 检查Token是否在黑名单中
     *
     * @param token Token
     * @return 是否在黑名单
     */
    public boolean isBlacklisted(String token) {
        String key = BLACKLIST_KEY_PREFIX + token;
        return Boolean.TRUE.equals(redisTemplate.hasKey(key));
    }

    /**
     * 获取Token剩余过期时间
     *
     * @param userId 用户ID
     * @return 剩余时间（毫秒），-1表示永不过期，-2表示不存在
     */
    public Long getTokenTTL(Long userId) {
        String key = TOKEN_KEY_PREFIX + userId;
        return redisTemplate.getExpire(key, TimeUnit.MILLISECONDS);
    }
}

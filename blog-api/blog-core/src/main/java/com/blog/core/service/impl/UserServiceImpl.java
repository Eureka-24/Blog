package com.blog.core.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.blog.core.dto.LoginRequest;
import com.blog.core.dto.LoginResponse;
import com.blog.core.entity.User;
import com.blog.core.mapper.UserMapper;
import com.blog.core.service.JwtTokenProvider;
import com.blog.core.service.RedisTokenService;
import com.blog.core.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserServiceImpl extends ServiceImpl<UserMapper, User> implements UserService {

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    private final JwtTokenProvider jwtTokenProvider;
    private final RedisTokenService redisTokenService;

    @Override
    public Page<User> getUsersPage(int page, int size) {
        Page<User> userPage = new Page<>(page, size);
        LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
        wrapper.orderByDesc(User::getCreateTime);
        page(userPage, wrapper);
        // 清除密码字段
        userPage.getRecords().forEach(user -> user.setPassword(null));
        return userPage;
    }

    @Override
    public LoginResponse login(LoginRequest request) {
        log.info("尝试登录: username={}", request.getUsername());
        
        // 查找用户
        User user = baseMapper.findByUsername(request.getUsername());
        if (user == null) {
            log.warn("用户不存在: {}", request.getUsername());
            throw new RuntimeException("用户名或密码错误");
        }
        
        log.info("找到用户: id={}, username={}, role={}", user.getId(), user.getUsername(), user.getRole());
        
        // 检查用户状态
        if (user.getStatus() == null || user.getStatus() == 0) {
            log.warn("用户已被禁用: {}", request.getUsername());
            throw new RuntimeException("用户已被禁用");
        }
        
        // 验证密码
        log.info("开始验证密码...");
        log.info("输入密码: {}", request.getPassword());
        log.info("存储密码: {}", user.getPassword());
        
        boolean passwordMatches = passwordEncoder.matches(request.getPassword(), user.getPassword());
        log.info("密码验证结果: {}", passwordMatches);
        
        if (!passwordMatches) {
            log.warn("密码错误: {}", request.getUsername());
            throw new RuntimeException("用户名或密码错误");
        }
        
        // 生成Token
        String token = generateToken(user);
        
        // 构建响应
        LoginResponse response = new LoginResponse();
        response.setToken(token);
        response.setUser(LoginResponse.UserInfo.fromUser(user));
        
        log.info("登录成功: username={}, role={}", user.getUsername(), user.getRole());
        return response;
    }

    @Override
    public User findByUsername(String username) {
        return baseMapper.findByUsername(username);
    }

    @Override
    public User findById(Long id) {
        return baseMapper.findById(id);
    }

    @Override
    public User validateToken(String token) {
        // 1. 先验证JWT有效性
        if (!jwtTokenProvider.validateToken(token)) {
            log.warn("JWT Token验证失败");
            return null;
        }
        
        // 2. 从JWT解析用户ID
        Long userId = jwtTokenProvider.getUserIdFromToken(token);
        if (userId == null) {
            log.warn("无法从Token解析用户ID");
            return null;
        }
        
        // 3. 验证Redis中的Token（单设备登录检查）
        if (!redisTokenService.validateToken(userId, token)) {
            log.warn("Redis Token验证失败，用户可能已在其他设备登录");
            return null;
        }
        
        // 4. 自动续期Token
        redisTokenService.extendTokenTTL(userId, 2592000000L); // 30天
        
        return findById(userId);
    }

    @Override
    public String generateToken(User user) {
        // 生成JWT Token
        String token = jwtTokenProvider.generateToken(user);
        // 保存到Redis（单设备登录会自动踢掉旧Token）
        redisTokenService.saveToken(user.getId(), token, 2592000000L); // 30天
        return token;
    }
    
    @Override
    public void logout(String token) {
        if (token == null || token.isEmpty()) {
            return;
        }
        Long userId = jwtTokenProvider.getUserIdFromToken(token);
        if (userId != null) {
            redisTokenService.deleteToken(userId);
            log.info("用户 {} 已登出", userId);
        }
    }
}

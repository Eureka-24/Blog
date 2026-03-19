package com.blog.core.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.blog.core.dto.LoginRequest;
import com.blog.core.dto.LoginResponse;
import com.blog.core.entity.User;
import com.blog.core.mapper.UserMapper;
import com.blog.core.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserServiceImpl extends ServiceImpl<UserMapper, User> implements UserService {

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    
    // 简单的内存Token存储（生产环境应使用Redis）
    private final Map<String, Long> tokenStore = new HashMap<>();

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
        Long userId = tokenStore.get(token);
        if (userId == null) {
            return null;
        }
        return findById(userId);
    }

    @Override
    public String generateToken(User user) {
        String token = UUID.randomUUID().toString().replace("-", "");
        tokenStore.put(token, user.getId());
        return token;
    }
}

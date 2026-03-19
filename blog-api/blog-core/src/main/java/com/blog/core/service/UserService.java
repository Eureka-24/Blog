package com.blog.core.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.blog.core.dto.LoginRequest;
import com.blog.core.dto.LoginResponse;
import com.blog.core.entity.User;

public interface UserService extends IService<User> {
    
    /**
     * 用户登录
     */
    LoginResponse login(LoginRequest request);
    
    /**
     * 根据用户名查找用户
     */
    User findByUsername(String username);
    
    /**
     * 根据ID查找用户
     */
    User findById(Long id);
    
    /**
     * 验证Token并返回用户信息
     */
    User validateToken(String token);
    
    /**
     * 生成Token
     */
    String generateToken(User user);
}

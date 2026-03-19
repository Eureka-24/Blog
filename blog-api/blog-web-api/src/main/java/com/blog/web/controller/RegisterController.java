package com.blog.web.controller;

import com.blog.core.entity.RegistrationCode;
import com.blog.core.entity.User;
import com.blog.core.service.RegistrationCodeService;
import com.blog.core.service.UserService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin
public class RegisterController {

    private final UserService userService;
    private final RegistrationCodeService registrationCodeService;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @PostMapping("/register")
    public ResponseEntity<RegisterResponse> register(@RequestBody RegisterRequest request) {
        log.info("用户注册请求: username={}, email={}", request.getUsername(), request.getEmail());
        
        // 1. 验证注册码
        RegistrationCode code = registrationCodeService.validateCode(request.getRegistrationCode());
        if (code == null) {
            log.warn("注册码无效: {}", request.getRegistrationCode());
            return ResponseEntity.badRequest().body(RegisterResponse.error("注册码无效或已过期"));
        }
        
        // 2. 检查用户名是否已存在
        User existingUser = userService.findByUsername(request.getUsername());
        if (existingUser != null) {
            log.warn("用户名已存在: {}", request.getUsername());
            return ResponseEntity.badRequest().body(RegisterResponse.error("用户名已存在"));
        }
        
        // 3. 创建用户
        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setEmail(request.getEmail());
        user.setNickname(request.getNickname());
        user.setRole(code.getType()); // 根据注册码类型设置角色
        user.setStatus(1); // 默认启用
        
        userService.save(user);
        
        // 4. 标记注册码为已使用
        registrationCodeService.useCode(code.getId(), user.getId());
        
        log.info("用户注册成功: username={}, role={}", user.getUsername(), user.getRole());
        
        return ResponseEntity.ok(RegisterResponse.success("注册成功", user.getId()));
    }

    @Data
    public static class RegisterRequest {
        private String username;
        private String password;
        private String email;
        private String nickname;
        private String registrationCode;
    }

    @Data
    public static class RegisterResponse {
        private boolean success;
        private String message;
        private Long userId;
        
        public static RegisterResponse success(String message, Long userId) {
            RegisterResponse response = new RegisterResponse();
            response.setSuccess(true);
            response.setMessage(message);
            response.setUserId(userId);
            return response;
        }
        
        public static RegisterResponse error(String message) {
            RegisterResponse response = new RegisterResponse();
            response.setSuccess(false);
            response.setMessage(message);
            return response;
        }
    }
}

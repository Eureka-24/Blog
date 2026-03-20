package com.blog.admin.controller;

import com.blog.core.dto.LoginRequest;
import com.blog.core.dto.LoginResponse;
import com.blog.core.entity.User;
import com.blog.core.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin
public class AuthController {

    private final UserService userService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        log.info("收到登录请求: username={}", request.getUsername());
        try {
            LoginResponse response = userService.login(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("登录失败: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/me")
    public ResponseEntity<LoginResponse.UserInfo> getCurrentUser(@RequestHeader(value = "Authorization", required = false) String token) {
        if (token == null || token.isEmpty()) {
            return ResponseEntity.status(401).build();
        }
        
        User user = userService.validateToken(token);
        if (user == null) {
            return ResponseEntity.status(401).build();
        }
        
        return ResponseEntity.ok(LoginResponse.UserInfo.fromUser(user));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@RequestHeader(value = "Authorization", required = false) String token) {
        if (token != null && !token.isEmpty()) {
            userService.logout(token);
        }
        return ResponseEntity.ok().build();
    }
}

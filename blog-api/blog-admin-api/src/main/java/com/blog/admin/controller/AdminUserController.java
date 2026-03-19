package com.blog.admin.controller;

import com.blog.core.entity.User;
import com.blog.core.service.UserService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@CrossOrigin
public class AdminUserController {

    private final UserService userService;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userService.list();
        // 清除密码字段
        users.forEach(user -> user.setPassword(null));
        return ResponseEntity.ok(users);
    }

    @PostMapping
    public ResponseEntity<User> createUser(@RequestBody CreateUserRequest request) {
        log.info("创建用户: username={}", request.getUsername());
        
        // 检查用户名是否已存在
        User existingUser = userService.findByUsername(request.getUsername());
        if (existingUser != null) {
            return ResponseEntity.badRequest().build();
        }
        
        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setEmail(request.getEmail());
        user.setNickname(request.getNickname());
        user.setRole(request.getRole());
        user.setStatus(1); // 默认启用
        
        userService.save(user);
        user.setPassword(null);
        return ResponseEntity.ok(user);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<User> updateUserStatus(@PathVariable Long id, @RequestBody UpdateStatusRequest request) {
        log.info("更新用户状态: id={}, status={}", id, request.getStatus());
        
        User user = userService.getById(id);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        
        user.setStatus(request.getStatus());
        userService.updateById(user);
        user.setPassword(null);
        return ResponseEntity.ok(user);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        log.info("删除用户: id={}", id);
        
        User user = userService.getById(id);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        
        userService.removeById(id);
        return ResponseEntity.ok().build();
    }

    @Data
    public static class CreateUserRequest {
        private String username;
        private String password;
        private String email;
        private String nickname;
        private Integer role; // 0:普通用户 1:管理员
    }

    @Data
    public static class UpdateStatusRequest {
        private Integer status; // 0:禁用 1:启用
    }
}

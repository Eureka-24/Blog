package com.blog.admin.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.blog.core.dto.PageResponse;
import com.blog.core.entity.RegistrationCode;
import com.blog.core.service.RegistrationCodeService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/admin/registration-codes")
@RequiredArgsConstructor
@CrossOrigin
public class AdminRegistrationCodeController {

    private final RegistrationCodeService registrationCodeService;

    @GetMapping
    public ResponseEntity<PageResponse<RegistrationCode>> getAllCodes(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<RegistrationCode> codePage = registrationCodeService.getCodesPage(page, size);
        return ResponseEntity.ok(PageResponse.from(codePage));
    }

    @PostMapping
    public ResponseEntity<RegistrationCode> generateCode(@RequestBody GenerateCodeRequest request) {
        log.info("生成注册码请求: type={}, expireHours={}", request.getType(), request.getExpireHours());
        RegistrationCode code = registrationCodeService.generateCode(request.getType(), request.getExpireHours());
        return ResponseEntity.ok(code);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCode(@PathVariable Long id) {
        log.info("删除注册码: id={}", id);
        boolean success = registrationCodeService.deleteCode(id);
        if (success) {
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @Data
    public static class GenerateCodeRequest {
        private Integer type; // 0:普通用户码 1:管理员码
        private Integer expireHours; // 有效期（小时）
    }
}

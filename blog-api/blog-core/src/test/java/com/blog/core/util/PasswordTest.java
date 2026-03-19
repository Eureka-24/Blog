package com.blog.core.util;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class PasswordTest {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        
        String rawPassword = "admin123";
        
        // 原来的 hash（可能不正确）
        String oldHash = "$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lqkkO9QS3TzCjH3rS";
        
        // 正确的 hash
        String correctHash1 = "$2a$10$GRLdNijSQMUvl/au9ofL.eDwmoohzzS7.rmNSJZ.0FxO/BTk76klW";
        String correctHash2 = "$2a$10$EqKcp1WFKVQISheBxmXNGexPR.i7QYXOJC.OFfQDT8iSaHuuPdlrW";
        
        System.out.println("=== BCrypt 密码验证测试 ===");
        System.out.println("原始密码: " + rawPassword);
        System.out.println();
        
        // 验证原来的 hash
        System.out.println("原来的 hash: " + oldHash);
        System.out.println("验证结果: " + encoder.matches(rawPassword, oldHash));
        System.out.println();
        
        // 验证正确的 hash 1
        System.out.println("正确的 hash 1: " + correctHash1);
        System.out.println("验证结果: " + encoder.matches(rawPassword, correctHash1));
        System.out.println();
        
        // 验证正确的 hash 2
        System.out.println("正确的 hash 2: " + correctHash2);
        System.out.println("验证结果: " + encoder.matches(rawPassword, correctHash2));
        System.out.println();
        
        // 生成新的 hash
        String newHash = encoder.encode(rawPassword);
        System.out.println("新生成的 hash: " + newHash);
        System.out.println("新 hash 验证结果: " + encoder.matches(rawPassword, newHash));
    }
}

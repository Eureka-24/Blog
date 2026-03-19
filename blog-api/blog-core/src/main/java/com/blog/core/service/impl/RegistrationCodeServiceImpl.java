package com.blog.core.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.blog.core.entity.RegistrationCode;
import com.blog.core.mapper.RegistrationCodeMapper;
import com.blog.core.service.RegistrationCodeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class RegistrationCodeServiceImpl extends ServiceImpl<RegistrationCodeMapper, RegistrationCode> implements RegistrationCodeService {
    
    private static final String CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    private static final int CODE_LENGTH = 8;
    private final SecureRandom random = new SecureRandom();
    
    @Override
    public RegistrationCode generateCode(Integer type, Integer expireHours) {
        String code = generateRandomCode();
        
        // 确保码不重复
        while (baseMapper.findByCode(code) != null) {
            code = generateRandomCode();
        }
        
        RegistrationCode registrationCode = new RegistrationCode();
        registrationCode.setCode(code);
        registrationCode.setType(type);
        registrationCode.setExpireTime(LocalDateTime.now().plusHours(expireHours));
        registrationCode.setIsUsed(false);
        
        baseMapper.insert(registrationCode);
        log.info("生成注册码: code={}, type={}, expireTime={}", code, type, registrationCode.getExpireTime());
        
        return registrationCode;
    }
    
    @Override
    public RegistrationCode validateCode(String code) {
        RegistrationCode registrationCode = baseMapper.findByCode(code);
        
        if (registrationCode == null) {
            log.warn("注册码不存在: {}", code);
            return null;
        }
        
        if (registrationCode.getIsUsed()) {
            log.warn("注册码已被使用: {}", code);
            return null;
        }
        
        if (registrationCode.getExpireTime().isBefore(LocalDateTime.now())) {
            log.warn("注册码已过期: {}", code);
            return null;
        }
        
        return registrationCode;
    }
    
    @Override
    public boolean useCode(Long codeId, Long userId) {
        int result = baseMapper.markAsUsed(codeId, userId);
        if (result > 0) {
            log.info("注册码已使用: codeId={}, userId={}", codeId, userId);
            return true;
        }
        return false;
    }
    
    @Override
    public List<RegistrationCode> getAllCodes() {
        return baseMapper.selectList(null);
    }
    
    @Override
    public boolean deleteCode(Long id) {
        int result = baseMapper.deleteById(id);
        return result > 0;
    }
    
    private String generateRandomCode() {
        StringBuilder sb = new StringBuilder(CODE_LENGTH);
        for (int i = 0; i < CODE_LENGTH; i++) {
            sb.append(CHARACTERS.charAt(random.nextInt(CHARACTERS.length())));
        }
        return sb.toString();
    }
}

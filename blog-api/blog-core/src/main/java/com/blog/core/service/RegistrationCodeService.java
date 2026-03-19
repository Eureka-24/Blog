package com.blog.core.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.blog.core.entity.RegistrationCode;

import java.time.LocalDateTime;
import java.util.List;

public interface RegistrationCodeService extends IService<RegistrationCode> {
    
    /**
     * 生成注册码
     * @param type 类型：0-普通用户码，1-管理员码
     * @param expireHours 有效期（小时）
     * @return 生成的注册码
     */
    RegistrationCode generateCode(Integer type, Integer expireHours);
    
    /**
     * 验证注册码
     * @param code 注册码
     * @return 注册码信息，无效则返回null
     */
    RegistrationCode validateCode(String code);
    
    /**
     * 使用注册码
     * @param codeId 注册码ID
     * @param userId 使用用户ID
     * @return 是否成功
     */
    boolean useCode(Long codeId, Long userId);
    
    /**
     * 获取所有注册码列表
     * @return 注册码列表
     */
    List<RegistrationCode> getAllCodes();
    
    /**
     * 删除注册码
     * @param id 注册码ID
     * @return 是否成功
     */
    boolean deleteCode(Long id);
}

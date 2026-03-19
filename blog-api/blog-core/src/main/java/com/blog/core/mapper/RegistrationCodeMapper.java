package com.blog.core.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.blog.core.entity.RegistrationCode;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

@Mapper
public interface RegistrationCodeMapper extends BaseMapper<RegistrationCode> {
    
    @Select("SELECT * FROM registration_codes WHERE code = #{code} LIMIT 1")
    RegistrationCode findByCode(@Param("code") String code);
    
    @Update("UPDATE registration_codes SET is_used = true, used_by = #{userId}, used_time = NOW() WHERE id = #{id}")
    int markAsUsed(@Param("id") Long id, @Param("userId") Long userId);
}

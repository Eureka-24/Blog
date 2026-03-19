package com.blog.core.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.blog.core.entity.User;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

public interface UserMapper extends BaseMapper<User> {
    
    @Select("SELECT * FROM users WHERE username = #{username}")
    User findByUsername(@Param("username") String username);
    
    @Select("SELECT * FROM users WHERE email = #{email}")
    User findByEmail(@Param("email") String email);
    
    @Select("SELECT * FROM users WHERE id = #{id}")
    User findById(@Param("id") Long id);
}

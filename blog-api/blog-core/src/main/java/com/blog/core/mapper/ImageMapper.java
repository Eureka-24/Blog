package com.blog.core.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.blog.core.entity.Image;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface ImageMapper extends BaseMapper<Image> {
    
    @Select("SELECT * FROM image WHERE article_id = #{articleId} ORDER BY create_time DESC")
    List<Image> selectByArticleId(@Param("articleId") Long articleId);
}

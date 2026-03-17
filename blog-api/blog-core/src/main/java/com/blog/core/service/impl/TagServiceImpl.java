package com.blog.core.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.blog.core.entity.Tag;
import com.blog.core.mapper.TagMapper;
import com.blog.core.service.TagService;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;

@Service
public class TagServiceImpl extends ServiceImpl<TagMapper, Tag> implements TagService {

    @Override
    public List<Tag> getTagsByArticleId(Long articleId) {
        return baseMapper.selectByArticleId(articleId);
    }

    @Override
    public List<Tag> getAllWithCount() {
        return baseMapper.selectAllWithCount();
    }

    @Override
    public Tag getOrCreateByName(String name) {
        if (!StringUtils.hasText(name)) {
            return null;
        }
        
        Tag tag = getOne(new LambdaQueryWrapper<Tag>()
                .eq(Tag::getName, name.trim()));
        
        if (tag == null) {
            tag = new Tag();
            tag.setName(name.trim());
            tag.setSlug(generateSlug(name));
            save(tag);
        }
        
        return tag;
    }

    private String generateSlug(String name) {
        return name.toLowerCase()
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-")
                .replaceAll("-+", "-");
    }
}

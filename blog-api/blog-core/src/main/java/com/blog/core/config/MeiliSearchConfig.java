package com.blog.core.config;

import com.meilisearch.sdk.Client;
import com.meilisearch.sdk.Config;
import com.meilisearch.sdk.Index;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Meilisearch 配置类
 */
@Slf4j
@Configuration
public class MeiliSearchConfig {

    @Value("${meilisearch.host:http://localhost:7700}")
    private String host;

    @Value("${meilisearch.api-key:blogSearchKey}")
    private String apiKey;

    @Value("${meilisearch.index-name:articles}")
    private String indexName;

    /**
     * 创建 Meilisearch 客户端
     */
    @Bean
    public Client meiliClient() {
        log.info("Initializing Meilisearch client, host: {}", host);
        return new Client(new Config(host, apiKey));
    }

    /**
     * 获取文章索引名称
     */
    public String getIndexName() {
        return indexName;
    }

    /**
     * 获取文章索引
     */
    @Bean
    public Index articleIndex(Client meiliClient) {
        try {
            Index index = meiliClient.index(indexName);
            log.info("Meilisearch article index initialized: {}", indexName);
            return index;
        } catch (Exception e) {
            log.error("Failed to initialize Meilisearch index: {}", e.getMessage());
            throw new RuntimeException("Failed to initialize Meilisearch index", e);
        }
    }
}

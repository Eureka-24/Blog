package com.blog.core.service.impl;

import com.meilisearch.sdk.Client;
import com.meilisearch.sdk.Index;
import com.meilisearch.sdk.SearchRequest;
import com.meilisearch.sdk.model.SearchResult;
import com.meilisearch.sdk.model.Settings;
import com.blog.core.config.MeiliSearchConfig;
import com.blog.core.dto.SearchResult.SearchHit;
import com.blog.core.entity.Article;
import com.blog.core.entity.Category;
import com.blog.core.service.ArticleService;
import com.blog.core.service.CategoryService;
import com.blog.core.service.SearchService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 搜索服务实现类
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SearchServiceImpl implements SearchService {

    private final Client meiliClient;
    private final MeiliSearchConfig meiliSearchConfig;
    private final ArticleService articleService;
    private final CategoryService categoryService;
    private final ObjectMapper objectMapper;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    /**
     * 获取索引名称
     */
    private String getIndexName() {
        return meiliSearchConfig.getIndexName();
    }

    @Override
    public com.blog.core.dto.SearchResult search(String query, int page, int size) {
        try {
            Index index = meiliClient.index(getIndexName());
            
            // 构建搜索请求
            // Meilisearch 的 offset 从 0 开始
            int offset = (page - 1) * size;
            
            SearchRequest searchRequest = new SearchRequest(query)
                    .setOffset(offset)
                    .setLimit(size)
                    .setAttributesToHighlight(new String[]{"title", "summary", "content"})
                    .setHighlightPreTag("<em>")
                    .setHighlightPostTag("</em>")
                    .setAttributesToRetrieve(new String[]{"id", "title", "summary", "slug", 
                            "coverImage", "categoryName", "viewCount", "createTime"});

            SearchResult meiliResult = (SearchResult) index.search(searchRequest);

            // 转换结果
            List<SearchHit> hits = convertHits(meiliResult);

            return com.blog.core.dto.SearchResult.builder()
                    .hits(hits)
                    .totalHits(meiliResult.getEstimatedTotalHits())
                    .processingTimeMs(meiliResult.getProcessingTimeMs())
                    .page(page)
                    .pageSize(size)
                    .build();

        } catch (Exception e) {
            log.error("Search failed for query: {}", query, e);
            return com.blog.core.dto.SearchResult.builder()
                    .hits(Collections.emptyList())
                    .totalHits(0)
                    .page(page)
                    .pageSize(size)
                    .build();
        }
    }

    /**
     * 转换搜索结果
     */
    @SuppressWarnings({"unchecked", "rawtypes"})
    private List<SearchHit> convertHits(SearchResult result) {
        List hits = result.getHits();
        List<SearchHit> searchHits = new ArrayList<>();
        
        for (Object obj : hits) {
            Map<String, Object> hit = (Map<String, Object>) obj;
            Long id = hit.get("id") != null ? ((Number) hit.get("id")).longValue() : null;
            String title = getStringValue(hit, "title");
            String summary = getStringValue(hit, "summary");
            String slug = getStringValue(hit, "slug");
            String coverImage = getStringValue(hit, "coverImage");
            String categoryName = getStringValue(hit, "categoryName");
            Integer viewCount = hit.get("viewCount") != null 
                    ? ((Number) hit.get("viewCount")).intValue() : 0;
            String createTime = getStringValue(hit, "createTime");

            // 获取高亮内容 - 从 _formatted 字段获取
            String highlightedTitle = title;
            String highlightedContent = summary;
            
            Object formattedObj = hit.get("_formatted");
            if (formattedObj instanceof Map) {
                Map<String, Object> formatted = (Map<String, Object>) formattedObj;
                highlightedTitle = getStringValue(formatted, "title");
                highlightedContent = getStringValue(formatted, "summary");
                if (highlightedContent == null) {
                    highlightedContent = getStringValue(formatted, "content");
                }
            }

            searchHits.add(SearchHit.builder()
                    .id(id)
                    .title(title)
                    .summary(summary)
                    .slug(slug)
                    .coverImage(coverImage)
                    .categoryName(categoryName)
                    .viewCount(viewCount)
                    .createTime(createTime)
                    .highlightedTitle(highlightedTitle)
                    .highlightedContent(highlightedContent)
                    .build());
        }
        return searchHits;
    }

    private String getStringValue(Map<String, Object> map, String key) {
        Object value = map.get(key);
        return value != null ? value.toString() : null;
    }

    @Override
    public void indexArticle(Article article) {
        try {
            Index index = meiliClient.index(getIndexName());
            Map<String, Object> document = convertToDocument(article);
            String json = objectMapper.writeValueAsString(Collections.singletonList(document));
            index.addDocuments(json);
            log.debug("Indexed article: {}", article.getId());
        } catch (Exception e) {
            log.error("Failed to index article: {}", article.getId(), e);
        }
    }

    @Override
    public void updateArticleIndex(Article article) {
        // Meilisearch 的 addDocuments 会自动更新已存在的文档
        indexArticle(article);
    }

    @Override
    public void deleteArticleIndex(Long articleId) {
        try {
            Index index = meiliClient.index(getIndexName());
            index.deleteDocument(String.valueOf(articleId));
            log.debug("Deleted article index: {}", articleId);
        } catch (Exception e) {
            log.error("Failed to delete article index: {}", articleId, e);
        }
    }

    @Override
    public int rebuildAllIndexes() {
        try {
            // 获取所有已发布的文章
            List<Article> articles = articleService.list();
            
            // 只索引已发布的文章（status = 1）
            List<Map<String, Object>> documents = articles.stream()
                    .filter(a -> a.getStatus() != null && a.getStatus() == 1)
                    .map(this::convertToDocument)
                    .collect(Collectors.toList());

            if (documents.isEmpty()) {
                log.info("No articles to index");
                return 0;
            }

            Index index = meiliClient.index(getIndexName());
            String json = objectMapper.writeValueAsString(documents);
            index.addDocuments(json);
            
            log.info("Rebuilt {} article indexes", documents.size());
            return documents.size();
        } catch (Exception e) {
            log.error("Failed to rebuild all indexes", e);
            return 0;
        }
    }

    @Override
    public void initIndexSettings() {
        try {
            Index index = meiliClient.index(getIndexName());
            
            Settings settings = new Settings();
            // 设置可搜索字段
            settings.setSearchableAttributes(new String[]{
                "title",      // 标题权重最高
                "summary",    // 摘要次之
                "content",    // 内容
                "categoryName" // 分类名称
            });
            
            // 设置可过滤字段
            settings.setFilterableAttributes(new String[]{
                "categoryName", "createTime"
            });
            
            // 设置可排序字段
            settings.setSortableAttributes(new String[]{
                "createTime", "viewCount"
            });
            
            // 设置返回字段
            settings.setDisplayedAttributes(new String[]{
                "id", "title", "summary", "slug", 
                "coverImage", "categoryName", "viewCount", "createTime"
            });
            
            index.updateSettings(settings);
            log.info("Initialized index settings for: {}", getIndexName());
        } catch (Exception e) {
            log.error("Failed to initialize index settings", e);
        }
    }

    /**
     * 将文章转换为 Meilisearch 文档
     */
    private Map<String, Object> convertToDocument(Article article) {
        Map<String, Object> doc = new HashMap<>();
        doc.put("id", article.getId());
        doc.put("title", article.getTitle());
        doc.put("summary", article.getSummary());
        doc.put("content", article.getContent());
        doc.put("slug", article.getSlug());
        doc.put("coverImage", article.getCoverImage());
        doc.put("viewCount", article.getViewCount());
        
        // 获取分类名称
        String categoryName = null;
        if (article.getCategory() != null) {
            categoryName = article.getCategory().getName();
        } else if (article.getCategoryId() != null) {
            Category category = categoryService.getById(article.getCategoryId());
            if (category != null) {
                categoryName = category.getName();
            }
        }
        doc.put("categoryName", categoryName);
        
        // 格式化时间
        if (article.getCreateTime() != null) {
            doc.put("createTime", article.getCreateTime().format(DATE_FORMATTER));
        }
        
        return doc;
    }
}

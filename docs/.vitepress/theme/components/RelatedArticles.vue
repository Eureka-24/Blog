<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, withBase } from 'vitepress'
import { useStatsApi, type RelatedArticle } from '../composables/useStatsApi'

const route = useRoute()
const { getRelatedArticles } = useStatsApi()
const articles = ref<RelatedArticle[]>([])
const loading = ref(true)
const hasError = ref(false)

onMounted(async () => {
  try {
    const res = await getRelatedArticles(route.path, 6)
    articles.value = res.items
  } catch (e) {
    console.error('RelatedArticles error:', e)
    hasError.value = true
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div v-if="!loading && !hasError && articles.length > 0" class="related-articles">
    <h3 class="related-title">📎 相关文章</h3>
    <ul class="related-list">
      <li v-for="item in articles" :key="item.path" class="related-item">
        <a :href="withBase(item.path)" class="related-link">
          <span class="related-name">{{ item.title }}</span>
          <span class="related-tags">
            <span v-for="tag in item.tags.slice(0, 2)" :key="tag" class="related-tag">{{ tag }}</span>
          </span>
          <span class="related-meta">{{ item.pv }} 次阅读</span>
        </a>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.related-articles {
  max-width: 1200px;
  margin: 0 auto;
  padding: 28px 1.5rem 0;
}

.related-title {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 14px;
  color: var(--vp-c-text-1);
}

.related-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 10px;
}

.related-item {
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  transition: transform 0.18s, box-shadow 0.18s;
  overflow: hidden;
}

.related-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}

.related-link {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px 14px;
  text-decoration: none;
  color: var(--vp-c-text-1);
}

.related-name {
  font-size: 0.88rem;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.related-link:hover .related-name {
  color: var(--vp-c-brand-1);
}

.related-tags {
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
}

.related-tag {
  font-size: 0.7rem;
  padding: 1px 7px;
  border-radius: 4px;
  background: color-mix(in srgb, var(--vp-c-brand-1) 12%, transparent);
  color: var(--vp-c-brand-1);
  white-space: nowrap;
}

.related-meta {
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
}
</style>

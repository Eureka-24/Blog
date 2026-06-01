<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useStatsApi, type HotArticle } from '../composables/useStatsApi'
import { withBase } from 'vitepress'

const props = withDefaults(defineProps<{
  cardStyle?: boolean
}>(), {
  cardStyle: false,
})

const { getHotArticles } = useStatsApi()
const articles = ref<HotArticle[]>([])
const loading = ref(true)

const pathTitleMap = ref<Record<string, string>>({})

onMounted(async () => {
  try {
    const statsRes = await fetch('/data/stats.json')
    const statsData = await statsRes.json()
    pathTitleMap.value = statsData.pathTitleMap || {}

    const res = await getHotArticles(10, '30d')
    articles.value = res.items
  } catch (e) {
    console.error('HotSidebar error:', e)
  } finally {
    loading.value = false
  }
})

function getTitle(path: string): string {
  // 解码 URL 编码并去掉 .html 后缀
  const cleanPath = decodeURIComponent(path).replace(/\.html$/, '')
  return pathTitleMap.value[cleanPath] || cleanPath.split('/').pop()?.replace(/-/g, ' ') || cleanPath
}
</script>

<template>
  <div v-if="!loading" :class="['hot-sidebar', { 'hot-card': cardStyle }]">
    <h3 class="hot-title">🔥 热门文章</h3>
    <div v-if="articles.length === 0" class="hot-empty">暂无数据，访问一些文章后即可查看</div>
    <ul v-else class="hot-list">
      <li v-for="(item, index) in articles" :key="item.path" class="hot-item">
        <span class="hot-rank" :class="{ 'hot-rank-top': index < 3 }">{{ index + 1 }}</span>
        <a :href="withBase(item.path)" class="hot-link">{{ getTitle(item.path) }}</a>
        <span class="hot-pv">{{ item.pv }} 次</span>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.hot-sidebar {
  padding: 12px 0;
}

/* 卡片模式：用于首页卡片区 */
.hot-card {
  padding: 16px;
  border-radius: 12px;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
}

.hot-title {
  font-size: 0.95rem;
  font-weight: 600;
  margin-bottom: 12px;
  padding: 0 12px;
  color: var(--vp-c-text-1);
}

.hot-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.hot-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  font-size: 0.85rem;
  transition: background 0.2s;
  border-radius: 6px;
}

.hot-item:hover {
  background: var(--vp-c-bg-mute);
}

.hot-rank {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  background: var(--vp-c-bg-mute);
  color: var(--vp-c-text-2);
}

.hot-rank-top {
  background: var(--vp-c-brand-1);
  color: #fff;
}

.hot-link {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--vp-c-text-1);
  text-decoration: none;
}

.hot-link:hover {
  color: var(--vp-c-brand-1);
}

.hot-pv {
  flex-shrink: 0;
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
}

.hot-empty {
  padding: 20px 12px;
  text-align: center;
  font-size: 0.85rem;
  color: var(--vp-c-text-3);
}
</style>

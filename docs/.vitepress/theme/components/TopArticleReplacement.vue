<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useStatsApi, type HotArticle } from '../composables/useStatsApi'
import { TkPageCard } from 'vitepress-theme-teek'

const { getHotArticles } = useStatsApi()
const articles = ref<HotArticle[]>([])
const loading = ref(true)
const pageNum = ref(1)
const pathTitleMap = ref<Record<string, string>>({})
const pageSize = 5

const totalPages = computed(() => Math.ceil(articles.value.length / pageSize))
const currentList = computed(() => {
  const start = (pageNum.value - 1) * pageSize
  return articles.value.slice(start, start + pageSize)
})

onMounted(async () => {
  try {
    const statsRes = await fetch('/data/stats.json')
    const statsData = await statsRes.json()
    pathTitleMap.value = statsData.pathTitleMap || {}

    const res = await getHotArticles(20, '30d')
    articles.value = res.items
  } catch (e) {
    console.error('TopArticleReplacement error:', e)
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
  <TkPageCard
    title="🔥 热门文章"
    :model-value="pageNum"
    :page-size="pageSize"
    :total="articles.length"
    :auto-page="false"
    @update:model-value="pageNum = $event"
  >
    <template #default="{ transitionName }">
      <div v-if="loading" class="tk-top-article__empty">加载中...</div>
      <div v-else-if="articles.length === 0" class="tk-top-article__empty">暂无数据，访问一些文章后即可查看</div>
      <TransitionGroup v-else :name="transitionName" tag="ul" mode="out-in" class="tk-top-article__list flx-column">
        <li
          v-for="(item, index) in currentList"
          :key="item.path"
          class="tk-top-article__list__item"
          :style="{ '--num-bg-color': ['#1890ff', '#52c41a', '#faad14', '#eb2f96', '#722ed1', '#13c2c2'][index % 6] }"
        >
          <span class="num">{{ (pageNum - 1) * pageSize + index + 1 }}</span>
          <div class="tk-top-article__list__item__info">
            <a :href="item.path" class="hover-color flx-align-center" style="font-weight:500">
              {{ getTitle(item.path) }}
            </a>
          </div>
          <span class="tk-top-article__list__item__pv">{{ item.pv }} 次</span>
        </li>
      </TransitionGroup>
    </template>
  </TkPageCard>
</template>

<style scoped>
.tk-top-article__empty {
  text-align: center;
  padding: 32px 0;
  color: var(--vp-c-text-3);
  font-size: 0.9rem;
}

.tk-top-article__list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.tk-top-article__list__item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px dashed var(--vp-c-divider);
}

.tk-top-article__list__item__pv {
  flex-shrink: 0;
  font-size: 0.8rem;
  color: var(--vp-c-text-3);
  white-space: nowrap;
}

.tk-top-article__list__item:last-child {
  border-bottom: none;
}

.num {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 700;
  color: #fff !important;
  background: var(--num-bg-color, var(--vp-c-brand-1));
}

.tk-top-article__list__item__info {
  flex: 1;
  min-width: 0;
}

.tk-top-article__list__item__info a {
  color: var(--vp-c-text-1);
  text-decoration: none;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: block;
  font-size: 0.85rem;
}

.tk-top-article__list__item__info a:hover {
  color: var(--vp-c-brand-1);
}

</style>

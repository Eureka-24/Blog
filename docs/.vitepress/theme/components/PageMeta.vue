<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vitepress'
import { useStatsApi } from '../composables/useStatsApi'

const route = useRoute()
const { recordVisit, recordDuration, getPageStats } = useStatsApi()

const pv = ref(0)
const uv = ref(0)
const likeCount = ref(0)
const avgDuration = ref(0)
const loaded = ref(false)

const path = route.path

// 阅读时长跟踪
let pageStartTime = Date.now()
let durationReported = false

function reportDuration() {
  if (durationReported) return
  const elapsed = Math.floor((Date.now() - pageStartTime) / 1000)
  if (elapsed >= 10 && elapsed <= 1800) {
    recordDuration(path, elapsed)
    durationReported = true
  }
}

onMounted(async () => {
  // 记录访问
  const referer = document.referrer ? new URL(document.referrer).hostname : undefined
  const visitRes = await recordVisit(path, referer)
  pv.value = visitRes.pv

  // 获取页面统计数据
  const stats = await getPageStats(path)
  uv.value = stats.uv
  likeCount.value = stats.likeCount
  avgDuration.value = stats.avgDuration
  loaded.value = true

  // 页面关闭/隐藏时上报阅读时长
  window.addEventListener('beforeunload', reportDuration)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) reportDuration()
  })
})

onBeforeUnmount(() => {
  reportDuration()
  window.removeEventListener('beforeunload', reportDuration)
})
</script>

<template>
  <span v-if="loaded" class="page-meta">
    <span class="meta-item">📖 阅读 {{ pv }} 次</span>
    <span v-if="avgDuration > 0" class="meta-item">
      ⏱ 平均 {{ avgDuration >= 60 ? `${Math.floor(avgDuration / 60)}分${Math.round(avgDuration % 60)}秒` : `${Math.round(avgDuration)}秒` }}
    </span>
    <span class="meta-item">❤️ {{ likeCount }}</span>
  </span>
  <span v-else class="page-meta page-meta-loading">加载中...</span>
</template>

<style scoped>
.page-meta {
  display: inline-flex;
  gap: 16px;
  font-size: 0.875rem;
  color: var(--vp-c-text-2);
}

.meta-item {
  white-space: nowrap;
}

.page-meta-loading {
  opacity: 0.5;
}
</style>

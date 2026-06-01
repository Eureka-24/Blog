<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vitepress'
import { useStatsApi } from '../composables/useStatsApi'

const route = useRoute()
const { toggleLike } = useStatsApi()

const liked = ref(false)
const count = ref(0)
const loading = ref(false)
const path = route.path

async function handleLike() {
  if (loading.value) return
  loading.value = true

  try {
    const action = liked.value ? 'unlike' : 'like'
    const res = await toggleLike(path, action)
    liked.value = res.liked
    count.value = res.count
  } catch (err) {
    console.error('Like failed:', err)
  } finally {
    loading.value = false
  }
}

// 初始化：从 PageMeta 传递的数据可以联动
// 实际项目中可以从 props 接收初始值
</script>

<template>
  <button
    class="like-button"
    :class="{ 'is-liked': liked, 'is-loading': loading }"
    :disabled="loading"
    @click="handleLike"
  >
    <span class="like-icon">{{ liked ? '❤️' : '🤍' }}</span>
    <span class="like-count">{{ count }}</span>
  </button>
</template>

<style scoped>
.like-button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 16px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 20px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-2);
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  user-select: none;
}

.like-button:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}

.like-button.is-liked {
  border-color: #e74c3c;
  color: #e74c3c;
  background: rgba(231, 76, 60, 0.05);
}

.like-button.is-loading {
  opacity: 0.6;
  cursor: not-allowed;
}

.like-icon {
  font-size: 1.1rem;
  line-height: 1;
}

.like-count {
  font-variant-numeric: tabular-nums;
}
</style>

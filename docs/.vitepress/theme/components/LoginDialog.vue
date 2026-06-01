<script setup lang="ts">
import { ref } from 'vue'
import { useStatsApi } from '../composables/useStatsApi'

const emit = defineEmits<{ login: [] }>()
const { login } = useStatsApi()

const password = ref('')
const error = ref('')
const loading = ref(false)

async function handleLogin() {
  error.value = ''
  loading.value = true
  const ok = await login(password.value)
  loading.value = false
  if (ok) {
    emit('login')
  } else {
    error.value = '密码错误'
  }
}
</script>

<template>
  <div class="login-overlay">
    <div class="login-card" @click.stop>
      <h2 class="login-title">🔐 管理员登录</h2>
      <form @submit.prevent="handleLogin">
        <input
          v-model="password"
          type="password"
          placeholder="请输入密码"
          class="login-input"
          autofocus
        />
        <p v-if="error" class="login-error">{{ error }}</p>
        <button type="submit" class="login-btn" :disabled="loading">
          {{ loading ? '验证中...' : '登录' }}
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.login-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.login-card {
  background: var(--vp-c-bg);
  border-radius: 12px;
  padding: 32px;
  width: 360px;
  max-width: 90vw;
  box-shadow: 0 8px 32px rgba(0,0,0,0.2);
}

.login-title {
  text-align: center;
  margin-bottom: 24px;
  font-size: 1.2rem;
}

.login-input {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  font-size: 1rem;
  outline: none;
  box-sizing: border-box;
}

.login-input:focus {
  border-color: var(--vp-c-brand-1);
}

.login-error {
  color: #e74c3c;
  font-size: 0.85rem;
  margin-top: 8px;
}

.login-btn {
  width: 100%;
  margin-top: 16px;
  padding: 10px;
  border: none;
  border-radius: 8px;
  background: var(--vp-c-brand-1);
  color: #fff;
  font-size: 1rem;
  cursor: pointer;
  transition: opacity 0.2s;
}

.login-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.login-btn:hover:not(:disabled) {
  opacity: 0.9;
}
</style>

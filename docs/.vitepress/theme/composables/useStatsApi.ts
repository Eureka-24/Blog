import { ref } from 'vue'

const SESSION_KEY = 'blog_session_id'
const TOKEN_KEY = 'blog_admin_token'

// API 基础路径：生产环境同源，开发环境走 vite proxy
const API_BASE = '/api/v1'

// ─── sessionId 管理 ───

function getOrCreateSessionId(): string {
  let sid = localStorage.getItem(SESSION_KEY)
  if (!sid) {
    // 兼容 HTTP 环境（crypto.randomUUID() 需要 HTTPS）
    sid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16)
    })
    localStorage.setItem(SESSION_KEY, sid)
  }
  return sid
}

// ─── 类型定义 ───

export interface PageStats {
  path: string
  pv: number
  uv: number
  likeCount: number
  avgDuration: number
}

export interface HotArticle {
  path: string
  pv: number
  likeCount: number
  avgDuration: number
}

export interface Overview {
  totalPv: number
  todayPv: number
  totalUv: number
  todayUv: number
  onlineNow: number
  articleCount: number
  totalWords: number
  siteAgeDays: number
  lastUpdated: string
}

export interface TrendItem {
  date: string
  pv: number
  uv: number
}

export interface PageStatsItem {
  path: string
  pv: number
  uv: number
  likeCount: number
  avgDuration: number
}

export interface PageStatsResponse {
  items: PageStatsItem[]
  total: number
  page: number
  size: number
}

export interface SourceItem {
  source: string
  pv: number
  percentage: number
}

export interface DeviceOS {
  name: string
  pv: number
  percentage: number
}

export interface DeviceBrowser {
  name: string
  pv: number
  percentage: number
}

export interface DevicesResponse {
  os: DeviceOS[]
  browsers: DeviceBrowser[]
}

export interface GeoItem {
  country: string
  pv: number
  percentage: number
}

export interface GeoResponse {
  items: GeoItem[]
}

// ─── API 封装 ───

async function request<T>(
  method: string,
  path: string,
  body?: Record<string, unknown>,
  useAuth = false,
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (useAuth) {
    const token = localStorage.getItem(TOKEN_KEY)
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`API error ${res.status}: ${err}`)
  }

  return res.json()
}

// ─── Composable ───

export function useStatsApi() {
  const sessionId = getOrCreateSessionId()
  const token = ref<string | null>(localStorage.getItem(TOKEN_KEY))
  const isAuthenticated = ref(!!token.value)

  // ====== 公开接口 ======

  /** 记录页面访问 */
  async function recordVisit(path: string, referer?: string) {
    return request<{ pv: number }>('POST', '/visit', {
      path,
      sessionId,
      referer: referer || null,
    })
  }

  /** 上报阅读时长 */
  async function recordDuration(path: string, durationSeconds: number) {
    return request<{ status: string }>('POST', '/visit/duration', {
      path,
      sessionId,
      durationSeconds,
    })
  }

  /** 点赞/取消点赞 */
  async function toggleLike(path: string, action: 'like' | 'unlike') {
    return request<{ liked: boolean; count: number }>('POST', '/like', {
      path,
      action,
    })
  }

  /** 获取单页统计数据 */
  async function getPageStats(path: string) {
    return request<PageStats>('GET', `/stats/page?path=${encodeURIComponent(path)}`)
  }

  /** 获取热门文章排行 */
  async function getHotArticles(limit = 10, period = '7d') {
    return request<{ items: HotArticle[] }>(
      'GET',
      `/stats/hot?limit=${limit}&period=${period}`,
    )
  }

  // ====== 认证 ======

  /** 管理员登录 */
  async function login(password: string): Promise<boolean> {
    try {
      const res = await request<{ token: string; expiresAt: string }>(
        'POST',
        '/auth/login',
        { password },
      )
      localStorage.setItem(TOKEN_KEY, res.token)
      token.value = res.token
      isAuthenticated.value = true
      return true
    } catch {
      return false
    }
  }

  /** 退出登录 */
  function logout() {
    localStorage.removeItem(TOKEN_KEY)
    token.value = null
    isAuthenticated.value = false
  }

  // ====== 看板接口（需认证） ======

  /** 获取总览数据 */
  async function getOverview() {
    return request<Overview>('GET', '/dashboard/overview', undefined, true)
  }

  /** 获取每日趋势 */
  async function getTrend(days = 30) {
    return request<{ items: TrendItem[] }>(
      'GET',
      `/dashboard/trend?days=${days}`,
      undefined,
      true,
    )
  }

  /** 获取页面排行 */
  async function getPages(sort = 'pv', page = 1, size = 20) {
    return request<PageStatsResponse>(
      'GET',
      `/dashboard/pages?sort=${sort}&page=${page}&size=${size}`,
      undefined,
      true,
    )
  }

  /** 获取流量来源 */
  async function getSources(days = 7) {
    return request<{ items: SourceItem[] }>(
      'GET',
      `/dashboard/sources?days=${days}`,
      undefined,
      true,
    )
  }

  /** 获取设备分布 */
  async function getDevices(days = 7) {
    return request<DevicesResponse>(
      'GET',
      `/dashboard/devices?days=${days}`,
      undefined,
      true,
    )
  }

  /** 获取地域分布 */
  async function getGeo(days = 30) {
    return request<GeoResponse>(
      'GET',
      `/dashboard/geo?days=${days}`,
      undefined,
      true,
    )
  }

  return {
    sessionId,
    token,
    isAuthenticated,
    recordVisit,
    recordDuration,
    toggleLike,
    getPageStats,
    getHotArticles,
    login,
    logout,
    getOverview,
    getTrend,
    getPages,
    getSources,
    getDevices,
    getGeo,
  }
}

// ─── CSV 导出工具 ───

/**
 * 将表格数据导出为 CSV 文件并触发下载
 * @param data 数据行数组
 * @param columns 列定义: [{ key, label }]
 * @param filename 文件名（不含 .csv）
 */
export function exportCSV<T extends Record<string, any>>(
  data: T[],
  columns: { key: string; label: string }[],
  filename: string,
) {
  // BOM for UTF-8 + Excel 中文兼容
  const BOM = '﻿'
  const header = columns.map((c) => `"${c.label}"`).join(',')
  const rows = data.map((row) =>
    columns.map((c) => `"${(row[c.key] ?? '').toString().replace(/"/g, '""')}"`).join(','),
  )
  const csv = BOM + header + '\n' + rows.join('\n')

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

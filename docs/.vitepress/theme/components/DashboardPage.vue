<script setup lang="ts">
import { ref, onMounted, nextTick, computed, watch } from "vue"
import { useStatsApi, exportCSV } from "../composables/useStatsApi"
import LoginDialog from "./LoginDialog.vue"
import * as echarts from "echarts"

const { isAuthenticated, logout, getOverview, getTrend, getPages, getSources, getDevices, getGeo, getGeoCities } = useStatsApi()

const showLogin = ref(!isAuthenticated.value)
const activeTab = ref<"overview" | "pages" | "sources" | "devices" | "geo">("overview")
const loading = ref(false)
const errMsg = ref("")
const overview = ref<any>(null)
const trendData = ref<any[]>([])
const pageData = ref<any[]>([])
const pageTotal = ref(0)
const sortBy = ref("pv")
const pageNo = ref(1)
const sourceData = ref<any[]>([])
const deviceData = ref<any>(null)
const geoData = ref<any[]>([])
const geoCityData = ref<any[]>([])
const geoView = ref<"country" | "city">("country")
const pathTitleMap = ref<Record<string, string>>({})

let chartTrend: any = null
let chartSources: any = null
let chartDevices: any = null

const tabs = [
  { key: "overview" as const, label: "总览", icon: "📊" },
  { key: "pages" as const, label: "排行", icon: "📄" },
  { key: "sources" as const, label: "来源", icon: "🔗" },
  { key: "devices" as const, label: "设备", icon: "💻" },
  { key: "geo" as const, label: "地域", icon: "🌍" },
]

const deviceView = ref<"os" | "browser">("os")

const hasTrendData = computed(() => trendData.value.length > 0)
const hasSourceData = computed(() => sourceData.value.length > 0)
const hasDeviceData = computed(() => (deviceData.value?.os?.length > 0) || (deviceData.value?.browsers?.length > 0))

function onLogin() { showLogin.value = false; loadData() }

async function loadData() {
  if (!isAuthenticated.value) return
  loading.value = true
  errMsg.value = ""

  // 加载文章标题映射
  try {
    const statsRes = await fetch("/data/stats.json")
    const statsData = await statsRes.json()
    pathTitleMap.value = statsData.pathTitleMap || {}
  } catch { /* ignore */ }

  // 逐个请求，互不影响
  const errors: string[] = []
  const safeFetch = async <T>(fn: () => Promise<T>, label: string): Promise<T | null> => {
    try { return await fn() } catch (e: any) { errors.push(`${label}: ${e.message}`); console.error(e); return null }
  }

  const [ov, tr, pg, src, dev, geo, geoCity] = await Promise.all([
    safeFetch(() => getOverview(), "总览"),
    safeFetch(() => getTrend(30), "趋势"),
    safeFetch(() => getPages(sortBy.value, pageNo.value, 20), "文章排行"),
    safeFetch(() => getSources(7), "来源"),
    safeFetch(() => getDevices(7), "设备"),
    safeFetch(() => getGeo(30), "地域(国家)"),
    safeFetch(() => getGeoCities(30), "地域(城市)"),
  ])
  if (ov) overview.value = ov
  if (tr) trendData.value = tr.items
  if (pg) { pageData.value = pg.items; pageTotal.value = pg.total }
  if (src) sourceData.value = src.items
  if (dev) deviceData.value = dev
  if (geo) geoData.value = geo.items
  if (geoCity) geoCityData.value = geoCity.items
  if (errors.length) errMsg.value = `部分数据加载失败: ${errors.join("; ")}`

  loading.value = false
  await nextTick()
  renderCharts()
}

function getArticleTitle(path: string): string {
  const cleanPath = decodeURIComponent(path).replace(/\.html$/, "")
  return pathTitleMap.value[cleanPath] || cleanPath.split("/").pop()?.replace(/-/g, " ") || cleanPath
}

function renderCharts() {
  // 趋势图
  const trendEl = document.getElementById("chart-trend")
  if (trendEl && trendData.value.length) {
    if (chartTrend) chartTrend.dispose()
    chartTrend = echarts.init(trendEl)
    chartTrend.setOption({
      color: ["#3451b2", "#52c41a"],
      tooltip: { trigger: "axis" },
      grid: { left: 45, right: 15, bottom: 26, top: 30 },
      xAxis: {
        type: "category",
        data: trendData.value.map((d) => d.date.slice(5)),
        axisLabel: { fontSize: 11, color: "var(--vp-c-text-2)" as any },
        axisLine: { lineStyle: { color: "var(--vp-c-divider)" as any } },
      },
      yAxis: {
        type: "value",
        min: 0,
        splitLine: { lineStyle: { color: "var(--vp-c-divider)" as any } },
        axisLabel: { color: "var(--vp-c-text-2)" as any },
      },
      series: [
        {
          name: "PV", type: "line", smooth: true,
          data: trendData.value.map((d) => d.pv),
          itemStyle: { color: "#3451b2" },
          areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: "rgba(52,81,178,0.15)" },
            { offset: 1, color: "rgba(52,81,178,0.01)" },
          ]) },
          symbol: "circle", symbolSize: 4,
        },
        {
          name: "UV", type: "line", smooth: true,
          data: trendData.value.map((d) => d.uv),
          itemStyle: { color: "#52c41a" },
          areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: "rgba(82,196,26,0.12)" },
            { offset: 1, color: "rgba(82,196,26,0.01)" },
          ]) },
          symbol: "circle", symbolSize: 4,
        },
      ],
      legend: {
        orient: "horizontal",
        right: 0,
        top: 0,
        textStyle: { color: "var(--vp-c-text-2)" as any, fontSize: 11 },
      },
    })
  }

  // 来源饼图
  const srcEl = document.getElementById("chart-sources")
  if (srcEl && sourceData.value.length) {
    if (chartSources) chartSources.dispose()
    chartSources = echarts.init(srcEl)
    chartSources.setOption({
      color: ["#3451b2", "#52c41a", "#faad14", "#eb2f96", "#13c2c2", "#722ed1"],
      tooltip: { trigger: "item", formatter: "{b}: {c} ({d}%)" },
      series: [{
        type: "pie",
        radius: ["50%", "72%"],
        center: ["50%", "50%"],
        data: sourceData.value.map((s) => ({ name: s.source, value: s.pv })),
        label: { formatter: "{b}\n{d}%", fontSize: 12 },
        emphasis: { label: { fontSize: 16, fontWeight: "bold" } },
      }],
    })
  }

  // 设备柱状图（根据 deviceView 切换 OS/浏览器）
  const devEl = document.getElementById("chart-devices")
  const devList = deviceView.value === "os" ? deviceData.value?.os : deviceData.value?.browsers
  if (devEl && devList?.length) {
    if (chartDevices) chartDevices.dispose()
    chartDevices = echarts.init(devEl)
    chartDevices.setOption({
      color: ["#3451b2"],
      tooltip: { trigger: "axis" },
      grid: { left: 40, right: 15, bottom: 25, top: 10 },
      xAxis: {
        type: "category",
        data: devList.map((d: any) => d.name),
        axisLabel: { fontSize: 11, color: "var(--vp-c-text-2)" as any },
        axisLine: { lineStyle: { color: "var(--vp-c-divider)" as any } },
      },
      yAxis: {
        type: "value", min: 0,
        splitLine: { lineStyle: { color: "var(--vp-c-divider)" as any } },
        axisLabel: { color: "var(--vp-c-text-2)" as any },
      },
      series: [{
        type: "bar",
        data: devList.map((d: any) => d.pv),
        barWidth: "40%",
        itemStyle: { borderRadius: [4, 4, 0, 0] },
      }],
    })
  }
}

async function changeSort(s: string) {
  sortBy.value = s; pageNo.value = 1
  const pg = await getPages(s, 1, 20)
  pageData.value = pg.items; pageTotal.value = pg.total
}

async function changePage(n: number) {
  pageNo.value = n
  const pg = await getPages(sortBy.value, n, 20)
  pageData.value = pg.items; pageTotal.value = pg.total
}

function handleLogout() { logout(); showLogin.value = true }

// ─── CSV 导出 ───
function exportPagesCSV() {
  const data = pageData.value.map((p: any) => ({
    title: getArticleTitle(p.path),
    path: p.path,
    pv: p.pv,
    uv: p.uv,
    likeCount: p.likeCount,
    avgDuration: Math.round(p.avgDuration) + "s",
  }))
  exportCSV(data, [
    { key: "title", label: "文章标题" },
    { key: "path", label: "路径" },
    { key: "pv", label: "PV" },
    { key: "uv", label: "UV" },
    { key: "likeCount", label: "点赞" },
    { key: "avgDuration", label: "平均阅读" },
  ], "文章排行")
}

function exportSourcesCSV() {
  exportCSV(sourceData.value, [
    { key: "source", label: "来源" },
    { key: "pv", label: "PV" },
    { key: "percentage", label: "占比(%)" },
  ], "来源分布")
}

function exportDevicesCSV() {
  const os = (deviceData.value?.os || []).map((d: any) => ({ type: "操作系统", name: d.name, pv: d.pv, percentage: d.percentage }))
  const br = (deviceData.value?.browsers || []).map((d: any) => ({ type: "浏览器", name: d.name, pv: d.pv, percentage: d.percentage }))
  exportCSV([...os, ...br], [
    { key: "type", label: "类别" },
    { key: "name", label: "名称" },
    { key: "pv", label: "PV" },
    { key: "percentage", label: "占比(%)" },
  ], "设备分布")
}

function exportGeoCSV() {
  if (geoView.value === "country") {
    exportCSV(geoData.value, [
      { key: "country", label: "国家/地区" },
      { key: "pv", label: "PV" },
      { key: "percentage", label: "占比(%)" },
    ], "地域分布(国家)")
  } else {
    exportCSV(geoCityData.value, [
      { key: "label", label: "位置" },
      { key: "pv", label: "PV" },
      { key: "percentage", label: "占比(%)" },
    ], "地域分布(城市)")
  }
}

onMounted(() => { if (isAuthenticated.value) loadData() })

// 切换 Tab 时重新渲染图表
watch(activeTab, async () => {
  await nextTick()
  renderCharts()
})

// 切换设备视图时重新渲染图表
watch(deviceView, async () => {
  await nextTick()
  renderCharts()
})
</script>


<template>
  <div class="dashboard">
    <LoginDialog v-if="showLogin" @login="onLogin" />

    <div v-else class="dashboard-body">
      <!-- 顶部 -->
      <div class="dashboard-header">
        <h1>📊 数据看板</h1>
        <span class="header-sub">了解博客访问概况</span>
        <button class="logout-btn" @click="handleLogout">退出</button>
      </div>

      <!-- 总览卡片 -->
      <div class="overview-cards">
        <div class="ov-card">
          <div class="ov-icon">👁️</div>
          <div class="ov-num">{{ overview?.totalPv?.toLocaleString() || 0 }}</div>
          <div class="ov-label">总浏览量</div>
        </div>
        <div class="ov-card ov-card--highlight">
          <div class="ov-icon">🔆</div>
          <div class="ov-num">{{ overview?.todayPv ?? 0 }}</div>
          <div class="ov-label">今日浏览量</div>
        </div>
        <div class="ov-card ov-card--pulse">
          <div class="ov-icon">🟢</div>
          <div class="ov-num">{{ overview?.onlineNow ?? 0 }}</div>
          <div class="ov-label">当前在线</div>
        </div>
        <div class="ov-card">
          <div class="ov-icon">👤</div>
          <div class="ov-num">{{ overview?.totalUv?.toLocaleString() || 0 }}</div>
          <div class="ov-label">总访客数</div>
        </div>
        <div class="ov-card">
          <div class="ov-icon">📅</div>
          <div class="ov-num">{{ overview?.todayUv ?? 0 }}</div>
          <div class="ov-label">今日访客数</div>
        </div>
      </div>

      <!-- Tab 导航 -->
      <div class="tab-nav">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          :class="['tab-btn', { active: activeTab === tab.key }]"
          @click="activeTab = tab.key"
        >
          <span class="tab-icon">{{ tab.icon }}</span>
          {{ tab.label }}
        </button>
      </div>

      <!-- 加载中 -->
      <div v-if="loading" class="dashboard-state">
        <div class="spinner"></div>
        <span>加载中...</span>
      </div>

      <!-- 错误 -->
      <div v-else-if="errMsg" class="dashboard-state dashboard-state--error">
        ⚠️ {{ errMsg }}
      </div>

      <!-- 总览 Tab -->
      <div v-if="!loading && !errMsg && activeTab === 'overview'" class="tab-content">
        <div v-if="hasTrendData" id="chart-trend" class="chart-box chart-box--trend"></div>
        <div v-else class="empty-hint">
          <span class="empty-icon">📈</span>
          <p>暂无趋势数据</p>
          <p class="empty-sub">访问几篇文章后，趋势图将在这里显示</p>
        </div>
      </div>

      <!-- 文章排行 Tab -->
      <div v-if="!loading && !errMsg && activeTab === 'pages'" class="tab-content">
        <div class="tab-toolbar">
          <div class="sort-bar">
            <span class="sort-label">排序：</span>
            <button :class="{ active: sortBy === 'pv' }" @click="changeSort('pv')">浏览量</button>
            <button :class="{ active: sortBy === 'uv' }" @click="changeSort('uv')">访客数</button>
          </div>
          <button v-if="pageData.length" class="export-btn" @click="exportPagesCSV">📥 导出 CSV</button>
        </div>
        <div v-if="pageData.length">
          <table class="page-table">
            <thead>
              <tr>
                <th style="width:44px">#</th>
                <th>文章标题</th>
                <th style="width:70px;text-align:center">PV</th>
                <th style="width:70px;text-align:center">UV</th>
                <th style="width:60px;text-align:center">点赞</th>
                <th style="width:80px;text-align:center">平均阅读</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(p, i) in pageData" :key="p.path">
                <td style="text-align:center" class="rank-cell">{{ (pageNo - 1) * 20 + i + 1 }}</td>
                <td class="page-path" :title="p.path">
                  <a :href="p.path">{{ getArticleTitle(p.path) }}</a>
                </td>
                <td style="text-align:center">{{ p.pv }}</td>
                <td style="text-align:center">{{ p.uv }}</td>
                <td style="text-align:center">{{ p.likeCount }}</td>
                <td style="text-align:center">{{ Math.round(p.avgDuration) }}s</td>
              </tr>
            </tbody>
          </table>
          <div class="pagination">
            <button :disabled="pageNo <= 1" @click="changePage(pageNo - 1)">‹ 上一页</button>
            <span class="page-info">{{ pageNo }} / {{ Math.ceil(pageTotal / 20) || 1 }}</span>
            <button :disabled="pageNo >= Math.ceil(pageTotal / 20)" @click="changePage(pageNo + 1)">下一页 ›</button>
          </div>
        </div>
        <div v-else class="empty-hint">
          <span class="empty-icon">📄</span>
          <p>暂无页面数据</p>
          <p class="empty-sub">访问几篇文章后，排行将在这里显示</p>
        </div>
      </div>

      <!-- 来源 Tab -->
      <div v-if="!loading && !errMsg && activeTab === 'sources'" class="tab-content">
        <div class="tab-toolbar">
          <span></span>
          <button v-if="sourceData.length" class="export-btn" @click="exportSourcesCSV">📥 导出 CSV</button>
        </div>
        <div v-if="hasSourceData" id="chart-sources" class="chart-box chart-box--pie"></div>
        <div v-else class="empty-hint">
          <span class="empty-icon">🔗</span>
          <p>暂无来源数据</p>
        </div>
        <table v-if="sourceData.length" class="page-table" style="margin-top:20px">
          <thead>
            <tr><th>来源</th><th style="width:80px;text-align:center">PV</th><th style="width:80px;text-align:center">占比</th></tr>
          </thead>
          <tbody>
            <tr v-for="s in sourceData" :key="s.source">
              <td>{{ s.source }}</td>
              <td style="text-align:center">{{ s.pv }}</td>
              <td style="text-align:center">{{ s.percentage }}%</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 设备 Tab -->
      <div v-if="!loading && !errMsg && activeTab === 'devices'" class="tab-content">
        <div class="tab-toolbar">
          <div class="device-toggle">
            <button :class="['toggle-btn', { active: deviceView === 'os' }]" @click="deviceView = 'os'">🖥️ 操作系统</button>
            <button :class="['toggle-btn', { active: deviceView === 'browser' }]" @click="deviceView = 'browser'">🌐 浏览器</button>
          </div>
          <button v-if="deviceData?.os?.length || deviceData?.browsers?.length" class="export-btn" @click="exportDevicesCSV">📥 导出 CSV</button>
        </div>

        <div v-if="hasDeviceData" id="chart-devices" class="chart-box chart-box--bar"></div>
        <div v-else class="empty-hint">
          <span class="empty-icon">💻</span>
          <p>暂无设备数据</p>
        </div>

        <!-- OS 表格 -->
        <table v-if="deviceView === 'os' && deviceData?.os?.length" class="page-table" style="margin-top:20px">
          <thead>
            <tr><th style="width:44px">#</th><th>操作系统</th><th style="width:80px;text-align:center">PV</th><th style="width:80px;text-align:center">占比</th></tr>
          </thead>
          <tbody>
            <tr v-for="(o, i) in deviceData?.os || []" :key="'os-' + o.name">
              <td style="text-align:center" class="rank-cell">{{ i + 1 }}</td>
              <td>{{ o.name }}</td>
              <td style="text-align:center">{{ o.pv }}</td>
              <td style="text-align:center">{{ o.percentage }}%</td>
            </tr>
          </tbody>
        </table>

        <!-- 浏览器表格 -->
        <table v-if="deviceView === 'browser' && deviceData?.browsers?.length" class="page-table" style="margin-top:20px">
          <thead>
            <tr><th style="width:44px">#</th><th>浏览器</th><th style="width:80px;text-align:center">PV</th><th style="width:80px;text-align:center">占比</th></tr>
          </thead>
          <tbody>
            <tr v-for="(b, i) in deviceData?.browsers || []" :key="'br-' + b.name">
              <td style="text-align:center" class="rank-cell">{{ i + 1 }}</td>
              <td>{{ b.name }}</td>
              <td style="text-align:center">{{ b.pv }}</td>
              <td style="text-align:center">{{ b.percentage }}%</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 地域 Tab -->
      <div v-if="!loading && !errMsg && activeTab === 'geo'" class="tab-content">
        <div class="tab-toolbar">
          <div class="device-toggle">
            <button :class="['toggle-btn', { active: geoView === 'country' }]" @click="geoView = 'country'">🌍 国家</button>
            <button :class="['toggle-btn', { active: geoView === 'city' }]" @click="geoView = 'city'">🏙️ 城市</button>
          </div>
          <button v-if="(geoView === 'country' && geoData.length) || (geoView === 'city' && geoCityData.length)" class="export-btn" @click="exportGeoCSV">📥 导出 CSV</button>
        </div>

        <!-- 国家视图 -->
        <table v-if="geoView === 'country' && geoData.length" class="page-table">
          <thead>
            <tr><th style="width:44px">#</th><th>国家/地区</th><th style="width:90px;text-align:center">PV</th><th style="width:80px;text-align:center">占比</th></tr>
          </thead>
          <tbody>
            <tr v-for="(g, i) in geoData" :key="g.country">
              <td style="text-align:center" class="rank-cell">{{ i + 1 }}</td>
              <td>
                <span v-if="g.country === 'CN'" style="margin-right:6px">🇨🇳</span>
                <span v-else-if="g.country === 'US'" style="margin-right:6px">🇺🇸</span>
                <span v-else-if="g.country === 'JP'" style="margin-right:6px">🇯🇵</span>
                <span v-else-if="g.country === 'SG'" style="margin-right:6px">🇸🇬</span>
                <span v-else-if="g.country === 'HK'" style="margin-right:6px">🇭🇰</span>
                <span v-else-if="g.country === 'TW'" style="margin-right:6px">🇹🇼</span>
                {{ g.country === "CN" ? "中国" : g.country === "US" ? "美国" : g.country === "JP" ? "日本" : g.country === "SG" ? "新加坡" : g.country === "HK" ? "香港" : g.country === "TW" ? "台湾" : g.country }}
              </td>
              <td style="text-align:center">{{ g.pv }}</td>
              <td style="text-align:center">{{ g.percentage }}%</td>
            </tr>
          </tbody>
        </table>

        <!-- 城市视图 -->
        <table v-if="geoView === 'city' && geoCityData.length" class="page-table">
          <thead>
            <tr><th style="width:44px">#</th><th>位置</th><th style="width:90px;text-align:center">PV</th><th style="width:80px;text-align:center">占比</th></tr>
          </thead>
          <tbody>
            <tr v-for="(g, i) in geoCityData" :key="g.label">
              <td style="text-align:center" class="rank-cell">{{ i + 1 }}</td>
              <td>{{ g.label }}</td>
              <td style="text-align:center">{{ g.pv }}</td>
              <td style="text-align:center">{{ g.percentage }}%</td>
            </tr>
          </tbody>
        </table>

        <div v-if="!geoData.length && !geoCityData.length" class="empty-hint">
          <span class="empty-icon">🌍</span>
          <p>暂无地域数据</p>
          <p class="empty-sub">访问一些文章后，地域分布将在这里显示</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ===== 整体布局 ===== */
.dashboard {
  min-height: calc(100vh - 64px);
  padding: 0;
}

.dashboard-body {
  max-width: 960px;
  margin: 0 auto;
  padding: 32px 24px 64px;
}

/* ===== 顶部栏 ===== */
.dashboard-header {
  display: flex;
  align-items: baseline;
  gap: 16px;
  margin-bottom: 28px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--vp-c-divider);
}

.dashboard-header h1 {
  font-size: 1.4rem;
  font-weight: 700;
  margin: 0;
  color: var(--vp-c-text-1);
}

.header-sub {
  flex: 1;
  font-size: 0.85rem;
  color: var(--vp-c-text-3);
}

.logout-btn {
  padding: 5px 14px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  background: transparent;
  color: var(--vp-c-text-2);
  cursor: pointer;
  font-size: 0.82rem;
  transition: all 0.2s;
}

.logout-btn:hover {
  border-color: #e74c3c;
  color: #e74c3c;
}

/* ===== 加载 / 错误状态 ===== */
.dashboard-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 80px 0;
  color: var(--vp-c-text-3);
  font-size: 0.9rem;
}

.dashboard-state--error {
  color: #e74c3c;
}

.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid var(--vp-c-divider);
  border-top-color: var(--vp-c-brand-1);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

/* ===== 总览卡片 ===== */
.overview-cards {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
  margin-bottom: 28px;
}

.ov-card {
  text-align: center;
  padding: 18px 10px 16px;
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  transition: transform 0.2s, box-shadow 0.2s;
}

.ov-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}

.ov-card--highlight {
  border-color: var(--vp-c-brand-1);
  background: color-mix(in srgb, var(--vp-c-brand-1) 5%, var(--vp-c-bg-soft));
}

.ov-card--pulse {
  border-color: #52c41a;
  background: rgba(82, 196, 26, 0.05);
}

.ov-icon {
  font-size: 1.3rem;
  margin-bottom: 6px;
}

.ov-num {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  font-variant-numeric: tabular-nums;
}

.ov-label {
  font-size: 0.78rem;
  color: var(--vp-c-text-3);
  margin-top: 4px;
}

/* ===== Tab 导航 ===== */
.tab-nav {
  display: flex;
  gap: 6px;
  margin-bottom: 24px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--vp-c-divider);
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  background: transparent;
  cursor: pointer;
  font-size: 0.88rem;
  color: var(--vp-c-text-2);
  transition: all 0.15s;
}

.tab-btn:hover {
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
}

.tab-btn.active {
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-brand-1);
  font-weight: 600;
}

.tab-icon {
  font-size: 0.95rem;
}

/* ===== 图表容器 ===== */
.chart-box {
  width: 100%;
  background: var(--vp-c-bg-soft);
  border-radius: 10px;
  border: 1px solid var(--vp-c-divider);
  padding: 16px;
  box-sizing: border-box;
}

.chart-box--trend { height: 380px; }

.chart-box--pie { height: 300px; }

.chart-box--bar { height: 260px; }

/* ===== 空数据提示（无灰色背景） ===== */
.empty-hint {
  text-align: center;
  padding: 48px 16px;
  color: var(--vp-c-text-3);
}

.empty-icon {
  font-size: 2.2rem;
  display: block;
  margin-bottom: 8px;
  opacity: 0.5;
}

.empty-hint p {
  margin: 0;
  font-size: 0.9rem;
}

.empty-sub {
  margin-top: 6px !important;
  font-size: 0.8rem !important;
  opacity: 0.7;
}

/* ===== Tab 工具栏（排序 + 导出） ===== */
.tab-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.export-btn {
  padding: 5px 14px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-2);
  cursor: pointer;
  font-size: 0.82rem;
  transition: all 0.15s;
  white-space: nowrap;
}

.export-btn:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
  background: color-mix(in srgb, var(--vp-c-brand-1) 5%, var(--vp-c-bg));
}

/* ===== 排序栏 ===== */
.sort-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
}

.sort-label {
  color: var(--vp-c-text-3);
}

.sort-bar button {
  padding: 4px 14px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 5px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-2);
  cursor: pointer;
  font-size: 0.82rem;
  transition: all 0.15s;
}

.sort-bar button:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}

.sort-bar button.active {
  border-color: var(--vp-c-brand-1);
  background: color-mix(in srgb, var(--vp-c-brand-1) 10%, var(--vp-c-bg));
  color: var(--vp-c-brand-1);
  font-weight: 600;
}

/* ===== 表格 ===== */
.page-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.84rem;
}

.page-table thead {
  background: var(--vp-c-bg-soft);
}

.page-table th {
  padding: 9px 10px;
  text-align: left;
  font-weight: 600;
  font-size: 0.78rem;
  color: var(--vp-c-text-3);
  border-bottom: 2px solid var(--vp-c-divider);
  white-space: nowrap;
}

.page-table td {
  padding: 9px 10px;
  border-bottom: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-1);
}

.page-table tbody tr:hover {
  background: var(--vp-c-bg-soft);
}

.rank-cell {
  color: var(--vp-c-text-3) !important;
}

.page-path {
  max-width: 360px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.page-path a {
  color: var(--vp-c-text-1);
  text-decoration: none;
}

.page-path a:hover {
  color: var(--vp-c-brand-1);
}

/* ===== 分页 ===== */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 14px;
  margin-top: 18px;
  font-size: 0.84rem;
}

.pagination button {
  padding: 5px 16px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-2);
  cursor: pointer;
  font-size: 0.82rem;
  transition: all 0.15s;
}

.pagination button:hover:not(:disabled) {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}

.pagination button:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.page-info {
  color: var(--vp-c-text-3);
}

/* ===== 设备标签 ===== */
.device-toggle {
  display: flex;
  gap: 10px;
}

.toggle-btn {
  padding: 6px 16px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-2);
  cursor: pointer;
  font-size: 0.84rem;
  transition: all 0.15s;
}

.toggle-btn:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}

.toggle-btn.active {
  background: var(--vp-c-brand-1);
  color: #fff;
  border-color: var(--vp-c-brand-1);
}

/* ===== 响应式 ===== */
@media (max-width: 768px) {
  .overview-cards {
    grid-template-columns: repeat(3, 1fr);
  }

  .dashboard-body {
    padding: 20px 12px 40px;
  }

  .tab-btn {
    padding: 7px 10px;
    font-size: 0.8rem;
  }

  .tab-icon {
    display: none;
  }
}

@media (max-width: 480px) {
  .overview-cards {
    grid-template-columns: repeat(2, 1fr);
  }

  .dashboard-header {
    flex-wrap: wrap;
  }
}
</style>

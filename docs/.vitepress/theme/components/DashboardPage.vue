<script setup lang="ts">
import { ref, onMounted, nextTick } from "vue"
import { useStatsApi } from "../composables/useStatsApi"
import LoginDialog from "./LoginDialog.vue"
import * as echarts from "echarts"
const { isAuthenticated, logout, getOverview, getTrend, getPages, getSources, getDevices } = useStatsApi()
const showLogin = ref(!isAuthenticated.value)
const activeTab = ref("overview")
const loading = ref(false)
const overview = ref(null)
const trendData = ref([])
const pageData = ref([])
const pageTotal = ref(0)
const sortBy = ref("pv")
const pageNo = ref(1)
const sourceData = ref([])
const deviceData = ref(null)
let chartTrend = null, chartSources = null, chartDevices = null
const tabs = [
  { key: "overview", label: "总览" },
  { key: "trend", label: "趋势" },
  { key: "pages", label: "页面" },
  { key: "sources", label: "来源" },
  { key: "devices", label: "设备" },
]
function onLogin() { showLogin.value = false; loadData() }
async function loadData() {
  if (!isAuthenticated.value) return; loading.value = true
  try {
    const [ov, tr, pg, src, dev] = await Promise.all([
      getOverview(), getTrend(30), getPages(sortBy.value, pageNo.value, 20), getSources(7), getDevices(7),
    ])
    overview.value = ov; trendData.value = tr.items; pageData.value = pg.items
    pageTotal.value = pg.total; sourceData.value = src.items; deviceData.value = dev
    await nextTick(); renderCharts()
  } catch (e) { console.error(e) } finally { loading.value = false }
}
function renderCharts() {
  const trendEl = document.getElementById("chart-trend")
  if (trendEl && trendData.value.length) {
    if (chartTrend) chartTrend.dispose()
    chartTrend = echarts.init(trendEl)
    chartTrend.setOption({
      tooltip: { trigger: "axis" },
      grid: { left: 50, right: 20, bottom: 30, top: 10 },
      xAxis: { type: "category", data: trendData.value.map(d => d.date.slice(5)), axisLabel: { fontSize: 11 } },
      yAxis: { type: "value", min: 0 },
      series: [
        { name: "PV", type: "line", smooth: true, data: trendData.value.map(d => d.pv), itemStyle: { color: "#1890ff" }, areaStyle: { color: "rgba(24,144,255,0.1)" } },
        { name: "UV", type: "line", smooth: true, data: trendData.value.map(d => d.uv), itemStyle: { color: "#52c41a" }, areaStyle: { color: "rgba(82,196,26,0.1)" } },
      ],
      legend: { bottom: 0 },
    })
  }
  const srcEl = document.getElementById("chart-sources")
  if (srcEl && sourceData.value.length) {
    if (chartSources) chartSources.dispose()
    chartSources = echarts.init(srcEl)
    chartSources.setOption({ tooltip: { trigger: "item", formatter: "{b}: {c} ({d}%)" }, series: [{ type: "pie", radius: ["40%", "65%"], data: sourceData.value.map(s => ({ name: s.source, value: s.pv })), label: { formatter: "{b}" } }] })
  }
  const devEl = document.getElementById("chart-devices")
  if (devEl && deviceData.value) {
    if (chartDevices) chartDevices.dispose()
    chartDevices = echarts.init(devEl)
    chartDevices.setOption({ tooltip: { trigger: "axis" }, grid: { left: 50, right: 20, bottom: 30, top: 10 }, xAxis: { type: "category", data: deviceData.value.os.map(o => o.name) }, yAxis: { type: "value", min: 0 }, series: [{ type: "bar", data: deviceData.value.os.map(o => o.pv), itemStyle: { color: "#1890ff" }, barWidth: "40%" }] })
  }
}
async function changeSort(s) { sortBy.value = s; pageNo.value = 1; const pg = await getPages(s, 1, 20); pageData.value = pg.items; pageTotal.value = pg.total }
async function changePage(n) { pageNo.value = n; const pg = await getPages(sortBy.value, n, 20); pageData.value = pg.items; pageTotal.value = pg.total }
function handleLogout() { logout(); showLogin.value = true }
onMounted(() => { if (isAuthenticated.value) loadData() })
</script>


<template>
  <div class="dashboard">
    <LoginDialog v-if="showLogin" @login="onLogin" />
    <div v-else class="dashboard-body">
      <div class="dashboard-header">
        <h1>Data Dashboard</h1>
        <button class="logout-btn" @click="handleLogout">Logout</button>
      </div>
      <div v-if="loading" class="dashboard-loading">Loading...</div>
      <template v-else>
        <div v-if="activeTab === 'overview' && overview" class="overview-cards">
          <div class="ov-card"><div class="ov-num">{{ overview.totalPv.toLocaleString() }}</div><div class="ov-label">Total PV</div></div>
          <div class="ov-card"><div class="ov-num">{{ overview.todayPv }}</div><div class="ov-label">Today PV</div></div>
          <div class="ov-card"><div class="ov-num">{{ overview.onlineNow }}</div><div class="ov-label">Online</div></div>
          <div class="ov-card"><div class="ov-num">{{ overview.totalUv.toLocaleString() }}</div><div class="ov-label">Total UV</div></div>
          <div class="ov-card"><div class="ov-num">{{ overview.todayUv }}</div><div class="ov-label">Today UV</div></div>
        </div>
        <div class="tab-nav">
          <button v-for="tab in tabs" :key="tab.key" :class='["tab-btn", { active: activeTab === tab.key }]' @click="activeTab = tab.key">{{ tab.label }}</button>
        </div>
        <div v-if="activeTab === 'overview' || activeTab === 'trend'" class="tab-content"><div id="chart-trend" class="chart-box" style="height:350px"></div></div>
        <div v-if="activeTab === 'pages'" class="tab-content">
          <div class="sort-bar"><span>Sort: </span><button :class="{ active: sortBy === 'pv' }" @click="changeSort('pv')">PV</button><button :class="{ active: sortBy === 'uv' }" @click="changeSort('uv')">UV</button></div>
          <table class="page-table"><thead><tr><th>#</th><th>Page</th><th>PV</th><th>UV</th><th>Like</th><th>Avg</th></tr></thead><tbody><tr v-for="(p, i) in pageData" :key="p.path"><td>{{ (pageNo - 1) * 20 + i + 1 }}</td><td class="page-path">{{ p.path }}</td><td>{{ p.pv }}</td><td>{{ p.uv }}</td><td>{{ p.likeCount }}</td><td>{{ Math.round(p.avgDuration) }}s</td></tr></tbody></table>
          <div class="pagination"><button :disabled="pageNo <= 1" @click="changePage(pageNo - 1)">Prev</button><span>{{ pageNo }} / {{ Math.ceil(pageTotal / 20) }}</span><button :disabled="pageNo >= Math.ceil(pageTotal / 20)" @click="changePage(pageNo + 1)">Next</button></div>
        </div>
        <div v-if="activeTab === 'sources'" class="tab-content">
          <div id="chart-sources" class="chart-box" style="height:300px"></div>
          <table class="page-table" style="margin-top:16px"><thead><tr><th>Source</th><th>PV</th><th>%</th></tr></thead><tbody><tr v-for="s in sourceData" :key="s.source"><td>{{ s.source }}</td><td>{{ s.pv }}</td><td>{{ s.percentage }}%</td></tr></tbody></table>
        </div>
        <div v-if="activeTab === 'devices'" class="tab-content">
          <div id="chart-devices" class="chart-box" style="height:300px"></div>
          <table class="page-table" style="margin-top:16px"><thead><tr><th>OS</th><th>PV</th><th>%</th></tr></thead><tbody><tr v-for="o in deviceData?.os || []" :key="o.name"><td>{{ o.name }}</td><td>{{ o.pv }}</td><td>{{ o.percentage }}%</td></tr></tbody></table>
          <table class="page-table" style="margin-top:16px"><thead><tr><th>Browser</th><th>PV</th><th>%</th></tr></thead><tbody><tr v-for="b in deviceData?.browsers || []" :key="b.name"><td>{{ b.name }}</td><td>{{ b.pv }}</td><td>{{ b.percentage }}%</td></tr></tbody></table>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.dashboard { min-height: 60vh; }
.dashboard-body { max-width: 1100px; margin: 0 auto; padding: 24px; }
.dashboard-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.dashboard-header h1 { font-size: 1.5rem; margin: 0; }
.logout-btn { padding: 6px 16px; border: 1px solid var(--vp-c-divider); border-radius: 6px; background: var(--vp-c-bg); cursor: pointer; font-size: 0.85rem; }
.logout-btn:hover { border-color: #e74c3c; color: #e74c3c; }
.dashboard-loading { text-align: center; padding: 60px; color: var(--vp-c-text-3); }
.overview-cards { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; margin-bottom: 24px; }
.ov-card { text-align: center; padding: 20px 8px; border-radius: 10px; background: var(--vp-c-bg-soft); border: 1px solid var(--vp-c-divider); }
.ov-num { font-size: 1.6rem; font-weight: 700; color: var(--vp-c-brand-1); }
.ov-label { font-size: 0.8rem; color: var(--vp-c-text-3); margin-top: 4px; }
.tab-nav { display: flex; gap: 4px; margin-bottom: 20px; border-bottom: 1px solid var(--vp-c-divider); }
.tab-btn { padding: 8px 18px; border: none; background: none; cursor: pointer; font-size: 0.9rem; color: var(--vp-c-text-2); border-bottom: 2px solid transparent; }
.tab-btn.active { color: var(--vp-c-brand-1); border-bottom-color: var(--vp-c-brand-1); font-weight: 600; }
.chart-box { width: 100%; background: var(--vp-c-bg-soft); border-radius: 10px; padding: 12px; box-sizing: border-box; }
.sort-bar { margin-bottom: 12px; display: flex; align-items: center; gap: 8px; font-size: 0.85rem; }
.sort-bar button { padding: 4px 12px; border: 1px solid var(--vp-c-divider); border-radius: 4px; background: var(--vp-c-bg); cursor: pointer; }
.sort-bar button.active { border-color: var(--vp-c-brand-1); color: var(--vp-c-brand-1); }
.page-table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
.page-table th, .page-table td { padding: 8px 10px; text-align: left; border-bottom: 1px solid var(--vp-c-divider); }
.page-table th { font-weight: 600; white-space: nowrap; }
.page-path { max-width: 280px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.pagination { display: flex; justify-content: center; align-items: center; gap: 16px; margin-top: 16px; font-size: 0.85rem; }
.pagination button { padding: 4px 14px; border: 1px solid var(--vp-c-divider); border-radius: 4px; background: var(--vp-c-bg); cursor: pointer; }
.pagination button:disabled { opacity: 0.4; cursor: not-allowed; }
</style>

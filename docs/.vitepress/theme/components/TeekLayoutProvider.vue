<script setup lang="ts">
import { onMounted, ref, watch, h, render, createVNode } from "vue";
import { useRoute } from "vitepress";
import Teek from "vitepress-theme-teek";
import ContributeChart from "./ContributeChart.vue";
import NotFound from "./404.vue";
import PageMeta from "./PageMeta.vue";
import LikeButton from "./LikeButton.vue";

const route = useRoute();

function isArticlePage(path: string): boolean {
  return (
    path !== "/" &&
    !path.startsWith("/@pages/") &&
    !path.startsWith("/dashboard") &&
    !path.includes("/personal") &&
    !path.endsWith("目录")
  );
}

// DOM 注入：在文章页查找标题和内容区域，挂载组件
let injected = false;

function injectComponents() {
  if (injected || !isArticlePage(route.path)) return;
  injected = true;

  // 等待 DOM 渲染完成
  setTimeout(() => {
    // 找文章内容容器
    const container =
      document.querySelector(".tk-article-page") ||
      document.querySelector(".content-container") ||
      document.querySelector(".vp-doc");

    if (!container) return;

    // --- 在 h1 标题后插入 PageMeta ---
    const h1 = container.querySelector("h1");
    if (h1 && h1.parentNode) {
      const metaWrapper = document.createElement("div");
      metaWrapper.className = "stats-page-meta-wrapper";
      h1.parentNode.insertBefore(metaWrapper, h1.nextSibling);
      const vnode = createVNode(PageMeta);
      render(vnode, metaWrapper);
    }

    // --- 在内容末尾插入 LikeButton ---
    const footer = document.createElement("div");
    footer.className = "stats-article-footer";
    container.appendChild(footer);
    const vnode2 = createVNode(LikeButton);
    render(vnode2, footer);
  }, 500);
}

// 路由变化时重新注入
watch(() => route.path, () => {
  injected = false;
  // 清理旧挂载点
  document.querySelectorAll(".stats-page-meta-wrapper, .stats-article-footer").forEach(el => {
    render(null, el);
    el.remove();
  });
  setTimeout(injectComponents, 500);
});

onMounted(() => {
  setTimeout(injectComponents, 500);
});
</script>

<template>
  <Teek.Layout>
    <template #teek-archives-top-before>
      <ContributeChart />
    </template>

    <template #not-found>
      <NotFound />
    </template>
  </Teek.Layout>
</template>

<style lang="scss">
.tk-my.is-circle-bg {
  margin-bottom: 20px;

  .tk-my__avatar.circle-rotate {
    margin-top: 200px;
  }
}

.stats-page-meta-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0.5rem 1.5rem 0;
}

.stats-article-footer {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: center;
  padding: 32px 0;
  border-top: 1px solid var(--vp-c-divider);
  margin-top: 32px;
}
</style>

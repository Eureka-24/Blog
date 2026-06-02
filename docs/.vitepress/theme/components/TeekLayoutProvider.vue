<script setup lang="ts" name="TeekLayoutProvider">
import { useRoute } from "vitepress";
import { computed } from "vue";
import Teek from "vitepress-theme-teek";
import ContributeChart from "./ContributeChart.vue";
import NotFound from "./404.vue";
import PageMeta from "./PageMeta.vue";
import LikeButton from "./LikeButton.vue";
import HotSidebar from "./HotSidebar.vue";
import TopArticleReplacement from "./TopArticleReplacement.vue";
import RelatedArticles from "./RelatedArticles.vue";

const route = useRoute();

const isArticlePage = computed(() => {
  const path = route.path;
  return (
    path !== "/" &&
    !path.startsWith("/@pages/") &&
    !path.startsWith("/dashboard") &&
    !path.includes("/personal") &&
    !path.endsWith("目录")
  );
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

    <template #doc-before>
      <ClientOnly>
        <div v-if="isArticlePage" class="stats-page-meta-wrapper">
          <PageMeta />
        </div>
      </ClientOnly>
    </template>

    <template #doc-after>
      <ClientOnly>
        <div v-if="isArticlePage" class="stats-article-footer">
          <LikeButton />
        </div>
      </ClientOnly>
      <!-- 相关文章推荐 -->
      <ClientOnly>
        <div v-if="isArticlePage" class="stats-related-wrapper">
          <RelatedArticles />
        </div>
      </ClientOnly>
    </template>

    <!-- 首页精选文章卡片 → 替换为热门文章 -->
    <template #teek-home-card-top-article>
      <ClientOnly>
        <TopArticleReplacement />
      </ClientOnly>
    </template>

    <!-- 右侧边栏大纲上方：热门文章 -->
    <template #aside-outline-before>
      <ClientOnly>
        <HotSidebar />
      </ClientOnly>
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

.stats-related-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding-bottom: 24px;
  border-top: 1px solid var(--vp-c-divider);
}
</style>

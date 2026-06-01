<script setup lang="ts">
import Teek from "vitepress-theme-teek";
import ContributeChart from "./ContributeChart.vue";
import NotFound from "./404.vue";
import PageMeta from "./PageMeta.vue";
import LikeButton from "./LikeButton.vue";

</script>

<template>
  <Teek.Layout>
    <template #teek-archives-top-before>
      <ContributeChart />
    </template>

    <template #not-found>
      <NotFound />
    </template>

    <!-- 文章页顶部：阅读量信息 -->
    <template #doc-before>
      <ClientOnly>
        <PageMeta />
      </ClientOnly>
    </template>

    <!-- 文章页底部：点赞按钮 -->
    <template #doc-after>
      <ClientOnly>
        <div class="stats-article-footer">
          <LikeButton />
        </div>
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

.stats-article-footer {
  display: flex;
  justify-content: center;
  padding: 32px 0;
  border-top: 1px solid var(--vp-c-divider);
  margin-top: 32px;
}
</style>

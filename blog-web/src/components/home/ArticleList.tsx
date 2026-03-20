'use client'

import type { Article } from '@/types'
import ArticleCard, { type ArticleCardData } from './ArticleCard'
import { getImageUrl } from '@/lib/api'
import { EmptyState } from '@/components/common'

interface ArticleListProps {
  articles: Article[]
}

/**
 * 将 Article 类型转换为 ArticleCardData 类型
 */
function convertToCardData(article: Article): ArticleCardData {
  return {
    id: article.id,
    title: article.title || '',
    summary: `${article.summary || article.content.substring(0, 200)}...`,
    coverImage: article.coverImage ? getImageUrl(article.coverImage) : null,
    categoryName: article.category?.name || null,
    createTime: article.createTime ? new Date(article.createTime).toLocaleDateString('zh-CN') : '-',
    viewCount: article.viewCount,
    slug: article.slug || null,
    tags: article.tags
  }
}

export default function ArticleList({ articles }: ArticleListProps) {
  if (articles.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8">
        <EmptyState icon="box" message="暂无文章" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {articles.map((article) => (
        <ArticleCard key={article.id} data={convertToCardData(article)} />
      ))}
    </div>
  )
}

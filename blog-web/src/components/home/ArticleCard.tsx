'use client'

import Link from 'next/link'
import type { Article } from '@/types'
import { getImageUrl } from '@/lib/api'

interface ArticleCardProps {
  article: Article
}

export default function ArticleCard({ article }: ArticleCardProps) {
  return (
    <article
      key={article.id}
      className="bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition-shadow duration-300"
    >
      {article.coverImage && (
        <div className="relative h-48 bg-gray-200">
          <img
            src={getImageUrl(article.coverImage)}
            alt={article.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="p-6">
        <div className="flex items-center gap-2 mb-2">
          {article.category && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {article.category.name}
            </span>
          )}
          <span className="text-sm text-gray-500">
            {article.createTime ? new Date(article.createTime).toLocaleDateString('zh-CN') : '-'}
          </span>
          <span className="text-sm text-gray-500">
            👁 {article.viewCount}
          </span>
        </div>
        
        <Link href={article.slug ? `/article/${article.slug}` : '#'} 
              onClick={(e) => !article.slug && e.preventDefault()}>
          <h2 className="text-xl font-semibold text-gray-900 mb-2 hover:text-blue-600">
            {article.title}
          </h2>
        </Link>
        
        <p className="text-gray-600 mb-4 line-clamp-3">
          {article.summary || article.content.substring(0, 200)}...
        </p>
        
        {article.tags && article.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {article.tags.map((tag) => (
              <span
                key={tag.id}
                className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 cursor-pointer"
              >
                #{tag.name}
              </span>
            ))}
          </div>
        )}
        
        <Link
          href={article.slug ? `/article/${article.slug}` : '#'}
          className="inline-flex items-center mt-4 text-blue-600 hover:text-blue-700"
          onClick={(e) => {
            if (!article.slug) {
              e.preventDefault();
              alert('文章暂无详情页面');
            }
          }}
        >
          阅读全文 →
        </Link>
      </div>
    </article>
  )
}

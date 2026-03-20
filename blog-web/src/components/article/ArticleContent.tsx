'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Article } from '@/types'
import { getImageUrl } from '@/lib/api'

interface ArticleContentProps {
  article: Article
}

export default function ArticleContent({ article }: ArticleContentProps) {
  return (
    <article className="bg-white rounded-lg shadow overflow-hidden">
      {/* 封面图 */}
      {article.coverImage && (
        <div className="relative h-64 sm:h-96 bg-gray-200">
          <img
            src={getImageUrl(article.coverImage) || ''}
            alt={article.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* 文章内容 */}
      <div className="p-6 sm:p-8">
        {/* 文章元信息 */}
        <div className="flex items-center gap-3 mb-4">
          {article.category && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              {article.category.name}
            </span>
          )}
          <span className="text-sm text-gray-500">
            {article.createTime ? new Date(article.createTime).toLocaleDateString('zh-CN', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            }) : '-'}
          </span>
          <span className="text-sm text-gray-500">
            👁 {article.viewCount} 次阅读
          </span>
        </div>

        {/* 标题 */}
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
          {article.title}
        </h1>

        {/* 标签 */}
        {article.tags && article.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {article.tags.map((tag) => (
              <span
                key={tag.id}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700"
              >
                #{tag.name}
              </span>
            ))}
          </div>
        )}

        {/* 文章内容 */}
        <div className="prose prose-lg max-w-none markdown-body">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {article.content || ''}
          </ReactMarkdown>
        </div>

        {/* 分享区域 */}
        <div className="border-t mt-8 pt-6">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">分享到：</span>
            <div className="flex gap-4">
              <button className="text-blue-600 hover:text-blue-700">
                微信
              </button>
              <button className="text-blue-400 hover:text-blue-500">
                微博
              </button>
              <button className="text-green-600 hover:text-green-700">
                朋友圈
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}

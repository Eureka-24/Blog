'use client'

import Link from 'next/link'
import { ReactNode } from 'react'

/**
 * 通用文章卡片组件 - 只负责展示，数据由父组件提供
 */
export interface ArticleCardData {
  id: number
  title: ReactNode | string
  summary: ReactNode | string
  coverImage: string | null
  categoryName: string | null
  createTime: string
  viewCount: number
  slug: string | null
  tags?: { id: number; name: string }[]
}

interface ArticleCardProps {
  data: ArticleCardData
}

export default function ArticleCard({ data }: ArticleCardProps) {
  const handleClick = (e: React.MouseEvent) => {
    if (!data.slug) {
      e.preventDefault()
      alert('文章暂无详情页面')
    }
  }

  return (
    <article
      className="bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition-shadow duration-300"
    >
      {data.coverImage && (
        <div className="relative h-48 bg-gray-200">
          <img
            src={data.coverImage}
            alt={typeof data.title === 'string' ? data.title : '文章封面'}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="p-6">
        <div className="flex items-center gap-2 mb-2">
          {data.categoryName && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {data.categoryName}
            </span>
          )}
          <span className="text-sm text-gray-500">
            {data.createTime}
          </span>
          <span className="text-sm text-gray-500">
            👁 {data.viewCount}
          </span>
        </div>

        <Link href={data.slug ? `/article/${data.slug}` : '#'}
              onClick={handleClick}>
          <h2 className="text-xl font-semibold text-gray-900 mb-2 hover:text-blue-600">
            {data.title}
          </h2>
        </Link>

        <p className="text-gray-600 mb-4 line-clamp-3">
          {data.summary}
        </p>

        {data.tags && data.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {data.tags.map((tag: { id: number; name: string }) => (
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
          href={data.slug ? `/article/${data.slug}` : '#'}
          className="inline-flex items-center mt-4 text-blue-600 hover:text-blue-700"
          onClick={handleClick}
        >
          阅读全文 →
        </Link>
      </div>
    </article>
  )
}

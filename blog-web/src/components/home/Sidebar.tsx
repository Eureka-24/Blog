'use client'

import type { Category, Tag } from '@/types'

interface SidebarProps {
  categories: Category[]
  tags: Tag[]
  filterCategory: number | null
  filterTag: number | null
  onCategoryClick: (categoryId: number | null) => void
  onTagClick: (tagId: number | null) => void
  onClearFilter: () => void
}

export default function Sidebar({ 
  categories, 
  tags, 
  filterCategory, 
  filterTag, 
  onCategoryClick, 
  onTagClick,
  onClearFilter 
}: SidebarProps) {
  return (
    <aside className="space-y-6">
      {/* 当前筛选 */}
      {(filterCategory || filterTag) && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">
              筛选：{filterCategory ? categories.find(c => c.id === filterCategory)?.name : tags.find(t => t.id === filterTag)?.name}
            </span>
            <button
              onClick={onClearFilter}
              className="text-blue-600 hover:text-blue-700 text-sm"
            >
              清除
            </button>
          </div>
        </div>
      )}

      {/* 分类 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">分类</h2>
        {categories.length === 0 ? (
          <p className="text-gray-500">暂无分类</p>
        ) : (
          <ul className="space-y-2">
            {categories.map((category) => (
              <li key={category.id}>
                <button
                  onClick={() => onCategoryClick(category.id!)}
                  className={`flex justify-between items-center w-full text-left ${
                    filterCategory === category.id ? 'text-blue-600 font-medium' : 'text-gray-700 hover:text-blue-600'
                  }`}
                >
                  <span>{category.name}</span>
                  <span className="text-sm text-gray-500">
                    {category.description || ''}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 标签 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">标签</h2>
        {tags.length === 0 ? (
          <p className="text-gray-500">暂无标签</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <button
                key={tag.id}
                onClick={() => onTagClick(tag.id!)}
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  filterTag === tag.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                }`}
              >
                #{tag.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </aside>
  )
}

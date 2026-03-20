'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { searchApi } from '@/lib/api'
import { getImageUrl } from '@/lib/api'
import { Header, Footer } from '@/components/layout'
import LoginModal from '@/components/LoginModal'
import type { SearchResult, SearchHit, User } from '@/types'

function SearchContent() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''
  const page = parseInt(searchParams.get('page') || '1', 10)
  
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // 登录状态
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [showLoginModal, setShowLoginModal] = useState(false)

  // 检查登录状态
  useEffect(() => {
    const token = localStorage.getItem('token')
    const user = localStorage.getItem('user')
    if (token && user) {
      setCurrentUser(JSON.parse(user))
    }
  }, [])

  // 退出登录
  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setCurrentUser(null)
  }

  useEffect(() => {
    if (query) {
      performSearch(query, page)
    }
  }, [query, page])

  const performSearch = async (searchQuery: string, pageNum: number) => {
    setLoading(true)
    setError(null)
    try {
      const result = await searchApi.search(searchQuery, pageNum, 10)
      setSearchResult(result)
    } catch (err) {
      console.error('Search failed:', err)
      setError('搜索失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  const renderHighlightedContent = (hit: SearchHit) => {
    const content = hit.highlightedContent || hit.summary || ''
    if (content.includes('<em>')) {
      return <span dangerouslySetInnerHTML={{ __html: content }} />
    }
    return <span>{content}</span>
  }

  const totalPages = searchResult ? Math.ceil(searchResult.totalHits / searchResult.pageSize) : 0

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        currentUser={currentUser} 
        onLogout={handleLogout} 
        onShowLogin={() => setShowLoginModal(true)} 
      />

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            搜索结果
          </h1>
          {query && (
            <p className="text-gray-600">
              {loading ? (
                '搜索中...'
              ) : searchResult ? (
                <>
                  找到 <span className="font-semibold">{searchResult.totalHits}</span> 条结果，关键词：
                  <span className="font-semibold">&quot;{query}&quot;</span>
                  {searchResult.processingTimeMs > 0 && (
                    <span className="text-gray-400 ml-2">
                      ({searchResult.processingTimeMs}ms)
                    </span>
                  )}
                </>
              ) : null}
            </p>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Search Results */}
        {!loading && searchResult && searchResult.hits.length > 0 && (
          <div className="space-y-6">
            {searchResult.hits.map((hit) => (
              <article
                key={hit.id}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden"
              >
                <Link href={`/article/${hit.slug}`} className="flex">
                  {hit.coverImage && (
                    <div className="w-48 h-32 flex-shrink-0">
                      <img
                        src={getImageUrl(hit.coverImage)}
                        alt={hit.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
                  <div className="flex-1 p-4">
                    <h2 className="text-lg font-semibold text-gray-900 mb-2 hover:text-blue-600">
                      {hit.highlightedTitle && hit.highlightedTitle.includes('<em>') ? (
                        <span dangerouslySetInnerHTML={{ __html: hit.highlightedTitle }} />
                      ) : (
                        hit.title
                      )}
                    </h2>
                    
                    <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                      {renderHighlightedContent(hit)}
                    </p>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      {hit.categoryName && (
                        <span className="bg-gray-100 px-2 py-1 rounded">
                          {hit.categoryName}
                        </span>
                      )}
                      <span>{hit.viewCount} 次浏览</span>
                      <span>{hit.createTime}</span>
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && query && searchResult && searchResult.hits.length === 0 && (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">未找到结果</h3>
            <p className="mt-1 text-gray-500">
              没有找到与 &quot;{query}&quot; 相关的文章，请尝试其他关键词
            </p>
          </div>
        )}

        {/* No Query State */}
        {!query && (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">请输入搜索关键词</h3>
            <p className="mt-1 text-gray-500">
              使用上方搜索框查找文章
            </p>
          </div>
        )}

        {/* Pagination */}
        {!loading && searchResult && totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            {page > 1 && (
              <Link
                href={`/search?q=${encodeURIComponent(query)}&page=${page - 1}`}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                上一页
              </Link>
            )}
            
            <span className="px-4 py-2 text-gray-600">
              第 {page} 页，共 {totalPages} 页
            </span>
            
            {page < totalPages && (
              <Link
                href={`/search?q=${encodeURIComponent(query)}&page=${page + 1}`}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                下一页
              </Link>
            )}
          </div>
        )}
      </main>

      <Footer />

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLoginSuccess={(user) => {
          setCurrentUser(user)
          setShowLoginModal(false)
        }}
      />
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  )
}

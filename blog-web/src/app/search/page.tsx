'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { searchApi, getImageUrl } from '@/lib/api'
import { Header, Footer } from '@/components/layout'
import LoginModal from '@/components/LoginModal'
import ArticleCard, { type ArticleCardData } from '@/components/home/ArticleCard'
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

  /**
   * 将 SearchHit 转换为 ArticleCardData
   */
  const convertToCardData = (hit: SearchHit): ArticleCardData => {
    const title = hit.highlightedTitle && hit.highlightedTitle.includes('<em>')
      ? <span dangerouslySetInnerHTML={{ __html: hit.highlightedTitle }} />
      : hit.title

    const content = hit.highlightedContent || hit.summary || ''
    const summary = content.includes('<em>')
      ? <span dangerouslySetInnerHTML={{ __html: content }} />
      : content

    return {
      id: hit.id,
      title,
      summary,
      coverImage: hit.coverImage ? getImageUrl(hit.coverImage) : null,
      categoryName: hit.categoryName,
      createTime: hit.createTime,
      viewCount: hit.viewCount,
      slug: hit.slug || null
    }
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
              <ArticleCard key={hit.id} data={convertToCardData(hit)} />
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
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              共 {searchResult.totalHits} 条结果
            </div>
            <div className="flex items-center gap-2">
              <Link
                href={`/search?q=${encodeURIComponent(query)}&page=${page - 1}`}
                className={`px-3 py-2 text-sm font-medium rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors ${page <= 1 ? 'pointer-events-none opacity-50' : ''}`}
              >
                上一页
              </Link>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <Link
                    key={pageNum}
                    href={`/search?q=${encodeURIComponent(query)}&page=${pageNum}`}
                    className={`w-10 h-10 text-sm font-medium rounded-md transition-colors flex items-center justify-center ${
                      pageNum === page
                        ? 'bg-blue-600 text-white'
                        : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </Link>
                ))}
              </div>

              <Link
                href={`/search?q=${encodeURIComponent(query)}&page=${page + 1}`}
                className={`px-3 py-2 text-sm font-medium rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors ${page >= totalPages ? 'pointer-events-none opacity-50' : ''}`}
              >
                下一页
              </Link>
            </div>
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

'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import type { User } from '@/types'

interface HeaderProps {
  currentUser: User | null
  onLogout: () => void
  onShowLogin: () => void
}

export default function Header({ currentUser, onLogout, onShowLogin }: HeaderProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState('')

  // Sync search query from URL when on search page
  useEffect(() => {
    const q = searchParams.get('q')
    if (q) {
      setSearchQuery(q)
    }
  }, [searchParams])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-gray-900">
            我的博客
          </Link>
          
          {/* Search Box */}
          <form onSubmit={handleSearch} className="flex-1 max-w-md mx-8">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索文章..."
                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg bg-white text-[#303133] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </form>
          
          <nav className="flex space-x-6 items-center">
            <Link href="/" className="text-gray-600 hover:text-gray-900">
              首页
            </Link>
            <a href="#" className="text-gray-600 hover:text-gray-900">
              关于
            </a>
            {/* Admin Entry - Only visible to admins */}
            {currentUser && currentUser.role === 1 && (
              <a
                href={process.env.NEXT_PUBLIC_ADMIN_URL || 'http://localhost:5173'}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                管理后台
              </a>
            )}
            {/* User Status */}
            {currentUser ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">
                  {currentUser.nickname || currentUser.username}
                </span>
                <button 
                  onClick={onLogout} 
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  退出
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link 
                  href="/register"
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  注册
                </Link>
                <button 
                  onClick={onShowLogin}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  登录
                </button>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}

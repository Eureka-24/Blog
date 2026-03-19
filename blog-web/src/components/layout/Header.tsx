'use client'

import Link from 'next/link'
import type { User } from '@/types'

interface HeaderProps {
  currentUser: User | null
  onLogout: () => void
  onShowLogin: () => void
}

export default function Header({ currentUser, onLogout, onShowLogin }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-gray-900">
            我的博客
          </Link>
          <nav className="flex space-x-6 items-center">
            <Link href="/" className="text-gray-600 hover:text-gray-900">
              首页
            </Link>
            <a href="#" className="text-gray-600 hover:text-gray-900">
              关于
            </a>
            {/* 管理员入口 - 仅管理员可见 */}
            {currentUser && currentUser.role === 1 && (
              <a 
                href={process.env.NEXT_PUBLIC_ADMIN_URL || 'http://localhost:5173'} 
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                管理后台
              </a>
            )}
            {/* 用户状态 */}
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

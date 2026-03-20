import { useState, useEffect } from 'react'
import { adminApi } from './lib/api'
import type { Category, Tag } from './types'
import LoginPage from './components/LoginPage'
import { MainLayout, type Page } from './components/layout'

// 页面组件
import Dashboard from './pages/Dashboard'
import ArticlesPage from './pages/Articles'
import CategoriesPage from './pages/Categories'
import TagsPage from './pages/Tags'
import CommentsPage from './pages/Comments'
import RegistrationCodesPage from './pages/RegistrationCodes'
import UsersPage from './pages/Users'

import './App.css'

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard')
  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // 登录状态
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)

  // 检查登录状态
  useEffect(() => {
    const token = localStorage.getItem('token')
    const user = localStorage.getItem('user')
    if (token && user) {
      setIsAuthenticated(true)
      setCurrentUser(JSON.parse(user))
    }
  }, [])

  // 加载数据函数（只加载分类和标签，其他数据由各页面自己加载）
  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [categoriesRes, tagsRes] = await Promise.all([
        adminApi.categories.getAll(),
        adminApi.tags.getAll(),
      ])
      setCategories(categoriesRes || [])
      setTags(tagsRes || [])
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '加载数据失败'
      setError(errorMsg)
      console.error('Error loading data:', err)
    } finally {
      setLoading(false)
    }
  }

  // 只有在已登录状态下才加载数据
  useEffect(() => {
    if (isAuthenticated) {
      loadData()
    }
  }, [isAuthenticated])

  // 登录成功回调
  const handleLoginSuccess = (user: any, token: string) => {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    setIsAuthenticated(true)
    setCurrentUser(user)
  }

  // 退出登录
  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setIsAuthenticated(false)
    setCurrentUser(null)
    // 清空数据
    setCategories([])
    setTags([])
    setError(null)
  }

  // 未登录时显示登录页面
  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />
  }

  // 渲染不同页面
  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard categories={categories} tags={tags} />
      case 'articles':
        return <ArticlesPage categories={categories} tags={tags} />
      case 'categories':
        return <CategoriesPage categories={categories} setCategories={setCategories} />
      case 'tags':
        return <TagsPage tags={tags} setTags={setTags} />
      case 'comments':
        return <CommentsPage />
      case 'registrationCodes':
        return <RegistrationCodesPage />
      case 'users':
        return <UsersPage />
      default:
        return null
    }
  }

  return (
    <MainLayout
      currentPage={currentPage}
      onPageChange={setCurrentPage}
      currentUser={currentUser}
      onLogout={handleLogout}
      pageTitle=""
      loading={loading}
      onRefresh={loadData}
      error={error}
    >
      {renderPage()}
    </MainLayout>
  )
}

export default App

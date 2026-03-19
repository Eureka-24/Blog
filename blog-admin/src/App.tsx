import { useState, useEffect } from 'react'
import { adminApi } from './lib/api'
import type { Article, Category, Tag, Comment, RegistrationCode, User } from './types'
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
  const [articles, setArticles] = useState<Article[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [comments, setComments] = useState<Comment[]>([])
  const [registrationCodes, setRegistrationCodes] = useState<RegistrationCode[]>([])
  const [users, setUsers] = useState<User[]>([])
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

  // 加载数据函数
  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [articlesRes, categoriesRes, tagsRes, commentsRes, codesRes, usersRes] = await Promise.all([
        adminApi.articles.getAll(),
        adminApi.categories.getAll(),
        adminApi.tags.getAll(),
        adminApi.comments.getAll(),
        adminApi.registrationCodes.getAll(),
        adminApi.users.getAll(),
      ])
      setArticles(articlesRes || [])
      setCategories(categoriesRes || [])
      setTags(tagsRes || [])
      setComments(commentsRes || [])
      setRegistrationCodes(codesRes || [])
      setUsers(usersRes || [])
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
    setArticles([])
    setCategories([])
    setTags([])
    setComments([])
    setRegistrationCodes([])
    setUsers([])
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
        return <Dashboard articles={articles} categories={categories} tags={tags} />
      case 'articles':
        return <ArticlesPage articles={articles} setArticles={setArticles} categories={categories} tags={tags} />
      case 'categories':
        return <CategoriesPage categories={categories} setCategories={setCategories} />
      case 'tags':
        return <TagsPage tags={tags} setTags={setTags} />
      case 'comments':
        return <CommentsPage comments={comments} setComments={setComments} articles={articles} />
      case 'registrationCodes':
        return <RegistrationCodesPage codes={registrationCodes} setCodes={setRegistrationCodes} />
      case 'users':
        return <UsersPage users={users} setUsers={setUsers} />
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

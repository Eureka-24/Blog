'use client'

import { useState, useEffect, useCallback } from 'react'
import type { User } from '@/types'

interface UseAuthReturn {
  currentUser: User | null
  showLoginModal: boolean
  setShowLoginModal: (show: boolean) => void
  handleLoginSuccess: (user: User, token: string) => void
  handleLogout: () => void
  checkAuth: () => boolean
}

export function useAuth(): UseAuthReturn {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [showLoginModal, setShowLoginModal] = useState(false)

  // 检查登录状态
  useEffect(() => {
    const token = localStorage.getItem('token')
    const user = localStorage.getItem('user')
    if (token && user) {
      try {
        setCurrentUser(JSON.parse(user))
      } catch (e) {
        console.error('Failed to parse user data:', e)
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    }
  }, [])

  // 登录成功回调
  const handleLoginSuccess = useCallback((user: User, token: string) => {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    setCurrentUser(user)
    setShowLoginModal(false)
  }, [])

  // 退出登录
  const handleLogout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setCurrentUser(null)
  }, [])

  // 检查是否已登录
  const checkAuth = useCallback(() => {
    return currentUser !== null
  }, [currentUser])

  return {
    currentUser,
    showLoginModal,
    setShowLoginModal,
    handleLoginSuccess,
    handleLogout,
    checkAuth
  }
}

export default useAuth

import { useState } from 'react'
import { adminApi } from '../lib/api'

interface LoginPageProps {
  onLoginSuccess: (user: any, token: string) => void
}

export default function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await adminApi.auth.login({ username, password })
      onLoginSuccess(response.user, response.token)
    } catch (err) {
      setError('用户名或密码错误')
      console.error('Login error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h1>博客管理系统</h1>
          <p>请登录以继续</p>
        </div>
        
        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="login-error">{error}</div>}
          
          <div className="form-group">
            <label htmlFor="username">用户名</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="请输入用户名"
              required
              autoFocus
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">密码</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="请输入密码"
              required
            />
          </div>
          
          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? '登录中...' : '登录'}
          </button>
        </form>
        
        <div className="login-footer">
          <p>默认管理员账号: admin / admin123</p>
        </div>
      </div>
    </div>
  )
}

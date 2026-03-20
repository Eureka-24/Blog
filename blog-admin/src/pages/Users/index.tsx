import { useState, useEffect } from 'react'
import { adminApi } from '../../lib/api'
import type { User, PageResponse } from '../../types'
import { Pagination } from '../../components/common'

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [pageData, setPageData] = useState<PageResponse<User> | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    nickname: '',
    role: 0,
  })
  const [formLoading, setFormLoading] = useState(false)

  // 加载用户数据
  const loadUsers = async () => {
    setLoading(true)
    try {
      const response = await adminApi.users.getAll(currentPage, pageSize)
      setUsers(response.records)
      setPageData(response)
    } catch (err) {
      console.error('Error loading users:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [currentPage])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleCreate = async () => {
    if (!formData.username || !formData.password) {
      alert('用户名和密码不能为空')
      return
    }
    setFormLoading(true)
    try {
      await adminApi.users.create(formData)
      setShowForm(false)
      setFormData({ username: '', password: '', email: '', nickname: '', role: 0 })
      loadUsers()
    } catch (err) {
      alert('创建用户失败，用户名可能已存在')
    } finally {
      setFormLoading(false)
    }
  }

  const handleToggleStatus = async (user: User) => {
    const newStatus = user.status === 1 ? 0 : 1
    try {
      await adminApi.users.updateStatus(user.id!, newStatus)
      loadUsers()
    } catch (err) {
      alert('更新状态失败')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这个用户吗？')) return
    try {
      await adminApi.users.delete(id)
      loadUsers()
    } catch (err) {
      alert('删除失败')
    }
  }

  const getRoleText = (role: number) => role === 1 ? '管理员' : '普通用户'

  return (
    <div className="users-page">
      <div className="section-header">
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? '取消' : '新增用户'}
        </button>
      </div>

      {showForm && (
        <div className="form-container">
          <h3>新增用户</h3>
          <div className="form-group">
            <label>用户名 *</label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              placeholder="请输入用户名"
            />
          </div>
          <div className="form-group">
            <label>密码 *</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="请输入密码"
            />
          </div>
          <div className="form-group">
            <label>邮箱</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="请输入邮箱"
            />
          </div>
          <div className="form-group">
            <label>昵称</label>
            <input
              type="text"
              value={formData.nickname}
              onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
              placeholder="请输入昵称"
            />
          </div>
          <div className="form-group">
            <label>角色</label>
            <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: Number(e.target.value) })}>
              <option value={0}>普通用户</option>
              <option value={1}>管理员</option>
            </select>
          </div>
          <div className="form-actions">
            <button className="btn-primary" onClick={handleCreate} disabled={formLoading}>
              {formLoading ? '创建中...' : '确认创建'}
            </button>
          </div>
        </div>
      )}

      <div className="users-list">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>用户名</th>
              <th>昵称</th>
              <th>邮箱</th>
              <th>角色</th>
              <th>状态</th>
              <th>创建时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={8} className="empty-cell">暂无用户</td>
              </tr>
            ) : (
              users.map(user => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.username}</td>
                  <td>{user.nickname || '-'}</td>
                  <td>{user.email || '-'}</td>
                  <td>{getRoleText(user.role)}</td>
                  <td>
                    <span className={`status-badge ${user.status === 1 ? 'status-active' : 'status-inactive'}`}>
                      {user.status === 1 ? '启用' : '禁用'}
                    </span>
                  </td>
                  <td>{user.createTime ? new Date(user.createTime).toLocaleString('zh-CN') : '-'}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className={user.status === 1 ? 'btn-warning' : 'btn-success'}
                        onClick={() => handleToggleStatus(user)}
                      >
                        {user.status === 1 ? '禁用' : '启用'}
                      </button>
                      <button className="btn-delete" onClick={() => handleDelete(user.id!)}>
                        删除
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {pageData && <Pagination page={pageData} onPageChange={handlePageChange} />}
      </div>
    </div>
  )
}

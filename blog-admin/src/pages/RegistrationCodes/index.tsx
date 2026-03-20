import { useState, useEffect } from 'react'
import { adminApi } from '../../lib/api'
import type { RegistrationCode, PageResponse } from '../../types'
import { Pagination } from '../../components/common'

export default function RegistrationCodesPage() {
  const [codes, setCodes] = useState<RegistrationCode[]>([])
  const [pageData, setPageData] = useState<PageResponse<RegistrationCode> | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)
  const [, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [codeType, setCodeType] = useState(0)
  const [expireHours, setExpireHours] = useState(24)
  const [formLoading, setFormLoading] = useState(false)

  // 加载注册码数据
  const loadCodes = async () => {
    setLoading(true)
    try {
      const response = await adminApi.registrationCodes.getAll(currentPage, pageSize)
      setCodes(response.records)
      setPageData(response)
    } catch (err) {
      console.error('Error loading registration codes:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCodes()
  }, [currentPage])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleGenerate = async () => {
    setFormLoading(true)
    try {
      const newCode = await adminApi.registrationCodes.generate({
        type: codeType,
        expireHours: expireHours,
      })
      setShowForm(false)
      loadCodes()
      alert(`注册码生成成功: ${newCode.code}`)
    } catch (err) {
      alert('生成注册码失败')
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这个注册码吗？')) return
    try {
      await adminApi.registrationCodes.delete(id)
      loadCodes()
    } catch (err) {
      alert('删除失败')
    }
  }

  const parseDate = (dateStr: string): Date => {
    if (!dateStr) return new Date()
    if (dateStr.includes('T')) {
      return new Date(dateStr)
    }
    return new Date(dateStr.replace(' ', 'T'))
  }

  const getTypeText = (type: number) => type === 1 ? '管理员码' : '普通用户码'
  const getStatusText = (code: RegistrationCode) => {
    if (code.isUsed) return '已使用'
    const expireTime = parseDate(code.expireTime)
    const now = new Date()
    
    console.log('Code:', code.code, 'expireTime raw:', code.expireTime, 'parsed:', expireTime, 'now:', now, 'isExpired:', expireTime < now)
    
    if (isNaN(expireTime.getTime())) {
      console.warn('Invalid expireTime:', code.expireTime)
      return '未知'
    }
    if (expireTime < now) return '已过期'
    return '有效'
  }

  return (
    <div className="page">
      <div className="section-header">
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? '取消' : '生成注册码'}
        </button>
      </div>

      {showForm && (
        <div className="form-container">
          <h3>生成新注册码</h3>
          <div className="form-group">
            <label>注册码类型</label>
            <select value={codeType} onChange={(e) => setCodeType(Number(e.target.value))}>
              <option value={0}>普通用户码</option>
              <option value={1}>管理员码</option>
            </select>
          </div>
          <div className="form-group">
            <label>有效期（小时）</label>
            <input
              type="number"
              value={expireHours}
              onChange={(e) => setExpireHours(Number(e.target.value))}
              min={1}
              max={720}
            />
          </div>
          <div className="form-actions">
            <button className="btn-primary" onClick={handleGenerate} disabled={formLoading}>
              {formLoading ? '生成中...' : '确认生成'}
            </button>
          </div>
        </div>
      )}

      <div className="codes-list">
        <table className="data-table">
          <thead>
            <tr>
              <th>注册码</th>
              <th>类型</th>
              <th>状态</th>
              <th>过期时间</th>
              <th>使用者</th>
              <th>使用时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {codes.length === 0 ? (
              <tr>
                <td colSpan={7} className="empty-cell">暂无注册码</td>
              </tr>
            ) : (
              codes.map(code => (
                <tr key={code.id}>
                  <td><code className="code-text">{code.code}</code></td>
                  <td>{getTypeText(code.type)}</td>
                  <td>
                    <span className={`status-badge ${getStatusText(code) === '有效' ? 'status-active' : code.isUsed ? 'status-used' : 'status-expired'}`}>
                      {getStatusText(code)}
                    </span>
                  </td>
                  <td>{parseDate(code.expireTime).toLocaleString('zh-CN')}</td>
                  <td>{code.usedBy || '-'}</td>
                  <td>{code.usedTime ? parseDate(code.usedTime).toLocaleString('zh-CN') : '-'}</td>
                  <td>
                    <button className="btn-delete" onClick={() => handleDelete(code.id!)}>
                      删除
                    </button>
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

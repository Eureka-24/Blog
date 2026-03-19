import { useState } from 'react'
import { adminApi } from '../../lib/api'
import type { RegistrationCode } from '../../types'

interface RegistrationCodesPageProps {
  codes: RegistrationCode[]
  setCodes: (codes: RegistrationCode[]) => void
}

export default function RegistrationCodesPage({ codes, setCodes }: RegistrationCodesPageProps) {
  const [showForm, setShowForm] = useState(false)
  const [codeType, setCodeType] = useState(0)
  const [expireHours, setExpireHours] = useState(24)
  const [loading, setLoading] = useState(false)

  const handleGenerate = async () => {
    setLoading(true)
    try {
      const newCode = await adminApi.registrationCodes.generate({
        type: codeType,
        expireHours: expireHours,
      })
      setCodes([newCode, ...codes])
      setShowForm(false)
      alert(`注册码生成成功: ${newCode.code}`)
    } catch (err) {
      alert('生成注册码失败')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这个注册码吗？')) return
    try {
      await adminApi.registrationCodes.delete(id)
      setCodes(codes.filter(c => c.id !== id))
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
    <div className="registration-codes-page">
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
            <button className="btn-primary" onClick={handleGenerate} disabled={loading}>
              {loading ? '生成中...' : '确认生成'}
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
      </div>
    </div>
  )
}

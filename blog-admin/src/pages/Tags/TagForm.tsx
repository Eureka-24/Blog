import { useState } from 'react'
import { adminApi } from '../../lib/api'
import type { Tag } from '../../types'

interface TagFormProps {
  tag?: Tag | null
  onSuccess: () => void
  onCancel: () => void
}

export default function TagForm({ tag, onSuccess, onCancel }: TagFormProps) {
  const [formData, setFormData] = useState<Partial<Tag>>({
    name: tag?.name || '',
  })
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      if (tag?.id) {
        await adminApi.tags.update(tag.id, formData)
      } else {
        await adminApi.tags.create(formData)
      }
      onSuccess()
    } catch (err) {
      alert('保存失败')
      console.error('Error saving tag:', err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <h3>{tag ? '编辑标签' : '新建标签'}</h3>
      
      <div className="form-group">
        <label>名称</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      <div className="form-actions">
        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? '保存中...' : '保存'}
        </button>
        <button type="button" onClick={onCancel}>
          取消
        </button>
      </div>
    </form>
  )
}

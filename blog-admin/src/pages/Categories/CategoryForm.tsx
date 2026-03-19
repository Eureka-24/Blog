import { useState } from 'react'
import { adminApi } from '../../lib/api'
import type { Category } from '../../types'

interface CategoryFormProps {
  category?: Category | null
  onSuccess: () => void
  onCancel: () => void
}

export default function CategoryForm({ category, onSuccess, onCancel }: CategoryFormProps) {
  const [formData, setFormData] = useState<Partial<Category>>({
    name: category?.name || '',
    description: category?.description || '',
    sortOrder: category?.sortOrder || 0,
  })
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      if (category?.id) {
        await adminApi.categories.update(category.id, formData)
      } else {
        await adminApi.categories.create(formData)
      }
      onSuccess()
    } catch (err) {
      alert('保存失败')
      console.error('Error saving category:', err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <h3>{category ? '编辑分类' : '新建分类'}</h3>
      
      <div className="form-group">
        <label>名称</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      <div className="form-group">
        <label>描述</label>
        <textarea
          value={formData.description || ''}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
        />
      </div>

      <div className="form-group">
        <label>排序</label>
        <input
          type="number"
          value={formData.sortOrder || 0}
          onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) })}
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

import { useState } from 'react'
import { adminApi } from '../../lib/api'
import type { Category } from '../../types'
import { EmptyState } from '../../components/common'
import CategoryForm from './CategoryForm'

interface CategoriesPageProps {
  categories: Category[]
  setCategories: (categories: Category[]) => void
}

export default function CategoriesPage({ categories, setCategories }: CategoriesPageProps) {
  const [showForm, setShowForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这个分类吗？')) return

    try {
      await adminApi.categories.delete(id)
      setCategories(categories.filter(c => c.id !== id))
    } catch (err) {
      alert('删除失败')
      console.error('Error deleting category:', err)
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <button 
          className="btn-primary"
          onClick={() => {
            setEditingCategory(null)
            setShowForm(!showForm)
          }}
        >
          {showForm ? '取消' : '+ 新建分类'}
        </button>
      </div>

      {showForm && (
        <CategoryForm
          category={editingCategory}
          onSuccess={() => {
            setShowForm(false)
            window.location.reload()
          }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {categories.length === 0 ? (
        <EmptyState message="暂无分类" />
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>名称</th>
              <th>描述</th>
              <th>排序</th>
              <th>创建时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {categories.map(category => (
              <tr key={category.id}>
                <td>{category.id}</td>
                <td>{category.name}</td>
                <td>{category.description || '-'}</td>
                <td>{category.sortOrder || 0}</td>
                <td>
                  {category.createTime 
                    ? new Date(category.createTime).toLocaleString('zh-CN')
                    : '-'}
                </td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="btn-edit"
                      onClick={() => {
                        setEditingCategory(category)
                        setShowForm(true)
                      }}
                    >
                      编辑
                    </button>
                    <button 
                      className="btn-delete"
                      onClick={() => handleDelete(category.id!)}
                    >
                      删除
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

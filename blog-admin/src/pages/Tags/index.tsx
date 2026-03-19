import { useState } from 'react'
import { adminApi } from '../../lib/api'
import type { Tag } from '../../types'
import { EmptyState } from '../../components/common'
import TagForm from './TagForm'

interface TagsPageProps {
  tags: Tag[]
  setTags: (tags: Tag[]) => void
}

export default function TagsPage({ tags, setTags }: TagsPageProps) {
  const [showForm, setShowForm] = useState(false)
  const [editingTag, setEditingTag] = useState<Tag | null>(null)

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这个标签吗？')) return

    try {
      await adminApi.tags.delete(id)
      setTags(tags.filter(t => t.id !== id))
    } catch (err) {
      alert('删除失败')
      console.error('Error deleting tag:', err)
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <button 
          className="btn-primary"
          onClick={() => {
            setEditingTag(null)
            setShowForm(!showForm)
          }}
        >
          {showForm ? '取消' : '+ 新建标签'}
        </button>
      </div>

      {showForm && (
        <TagForm
          tag={editingTag}
          onSuccess={() => {
            setShowForm(false)
            window.location.reload()
          }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {tags.length === 0 ? (
        <EmptyState message="暂无标签" />
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>名称</th>
              <th>创建时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {tags.map(tag => (
              <tr key={tag.id}>
                <td>{tag.id}</td>
                <td>{tag.name}</td>
                <td>
                  {tag.createTime 
                    ? new Date(tag.createTime).toLocaleString('zh-CN')
                    : '-'}
                </td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="btn-edit"
                      onClick={() => {
                        setEditingTag(tag)
                        setShowForm(true)
                      }}
                    >
                      编辑
                    </button>
                    <button 
                      className="btn-delete"
                      onClick={() => handleDelete(tag.id!)}
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

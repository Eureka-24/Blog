import { useState } from 'react'
import { adminApi, getImageUrl } from '../../lib/api'
import type { Article, Category, Tag } from '../../types'
import ImageUploader from '../../components/common/ImageUploader'

interface ArticleFormProps {
  article?: Article | null
  categories: Category[]
  tags: Tag[]
  onSuccess: () => void
  onCancel: () => void
}

export default function ArticleForm({ article, categories, tags, onSuccess, onCancel }: ArticleFormProps) {
  const [formData, setFormData] = useState<Partial<Article>>({
    title: article?.title || '',
    content: article?.content || '',
    summary: article?.summary || '',
    categoryId: article?.categoryId,
    status: article?.status || 0,
    coverImage: article?.coverImage || '',
  })
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>(
    article?.tags?.map(t => t.id!) || []
  )
  const [submitting, setSubmitting] = useState(false)
  const [showImageUploader, setShowImageUploader] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const requestData = {
        article: formData,
        tagIds: selectedTagIds,
      }
      if (article?.id) {
        await adminApi.articles.update(article.id, requestData)
      } else {
        await adminApi.articles.create(requestData)
      }
      onSuccess()
    } catch (err) {
      alert('保存失败')
      console.error('Error saving article:', err)
    } finally {
      setSubmitting(false)
    }
  }

  const toggleTag = (tagId: number) => {
    setSelectedTagIds(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    )
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <h3>{article ? '编辑文章' : '新建文章'}</h3>
      
      <div className="form-group">
        <label>标题 *</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>分类</label>
          <select
            value={formData.categoryId || ''}
            onChange={(e) => setFormData({ ...formData, categoryId: e.target.value ? Number(e.target.value) : undefined })}
          >
            <option value="">选择分类</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>状态</label>
          <select
            value={formData.status || 0}
            onChange={(e) => setFormData({ ...formData, status: Number(e.target.value) })}
          >
            <option value={0}>草稿</option>
            <option value={1}>已发布</option>
          </select>
        </div>
      </div>

      <div className="form-group">
        <label>标签</label>
        <div className="tag-selector">
          {tags.length === 0 ? (
            <span className="empty-hint">暂无标签，请先创建标签</span>
          ) : (
            tags.map(tag => (
              <label key={tag.id} className="tag-checkbox">
                <input
                  type="checkbox"
                  checked={selectedTagIds.includes(tag.id!)}
                  onChange={() => toggleTag(tag.id!)}
                />
                <span>{tag.name}</span>
              </label>
            ))
          )}
        </div>
      </div>

      <div className="form-group">
        <label>摘要</label>
        <textarea
          value={formData.summary}
          onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
          rows={3}
          placeholder="文章摘要（可选）"
        />
      </div>

      <div className="form-group">
        <label>内容 *</label>
        <div className="content-toolbar">
          <button 
            type="button" 
            className="btn-toolbar"
            onClick={() => setShowImageUploader(!showImageUploader)}
          >
            {showImageUploader ? '隐藏图片库' : '插入图片'}
          </button>
        </div>
        <textarea
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          rows={12}
          required
          placeholder="支持 Markdown 格式"
        />
        {showImageUploader && (
          <ImageUploader
            articleId={article?.id}
            onImageSelect={(url) => {
              const imageMarkdown = `![图片](${url})`
              setFormData(prev => ({
                ...prev,
                content: prev.content ? `${prev.content}\n${imageMarkdown}` : imageMarkdown
              }))
            }}
            onCoverSelect={(url) => {
              setFormData(prev => ({ ...prev, coverImage: url }))
            }}
            selectedCoverUrl={formData.coverImage || undefined}
          />
        )}
      </div>

      <div className="form-group">
        <label>封面图片</label>
        <div className="cover-image-section">
          {formData.coverImage ? (
            <div className="cover-preview">
              <img src={getImageUrl(formData.coverImage)} alt="封面预览" />
              <button 
                type="button" 
                className="btn-remove-cover"
                onClick={() => setFormData({ ...formData, coverImage: '' })}
              >
                移除
              </button>
            </div>
          ) : (
            <div className="cover-placeholder">
              <span>暂无封面</span>
            </div>
          )}
          <input
            type="url"
            value={formData.coverImage || ''}
            onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
            placeholder="输入图片URL或从下方选择"
          />
        </div>
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

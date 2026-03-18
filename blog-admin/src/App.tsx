import { useState, useEffect } from 'react'
import { adminApi } from './lib/api'
import type { Article, ArticleRequest, Category, Tag } from './types'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import './App.css'

type Page = 'dashboard' | 'articles' | 'categories' | 'tags'

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard')
  const [articles, setArticles] = useState<Article[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 加载数据
  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [articlesRes, categoriesRes, tagsRes] = await Promise.all([
        adminApi.articles.getAll(),
        adminApi.categories.getAll(),
        adminApi.tags.getAll(),
      ])
      setArticles(articlesRes || [])
      setCategories(categoriesRes || [])
      setTags(tagsRes || [])
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '加载数据失败'
      setError(errorMsg)
      console.error('Error loading data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // 渲染不同页面
  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard articles={articles} categories={categories} tags={tags} />
      case 'articles':
        return <ArticlesPage articles={articles} setArticles={setArticles} categories={categories} tags={tags} />
      case 'categories':
        return <CategoriesPage categories={categories} setCategories={setCategories} />
      case 'tags':
        return <TagsPage tags={tags} setTags={setTags} />
      default:
        return null
    }
  }

  return (
    <div className="app">
      {/* 侧边栏导航 */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1>博客管理系统</h1>
        </div>
        <nav className="sidebar-nav">
          <button
            className={`nav-item ${currentPage === 'dashboard' ? 'active' : ''}`}
            onClick={() => setCurrentPage('dashboard')}
          >
            📊 仪表盘
          </button>
          <button
            className={`nav-item ${currentPage === 'articles' ? 'active' : ''}`}
            onClick={() => setCurrentPage('articles')}
          >
            📝 文章管理
          </button>
          <button
            className={`nav-item ${currentPage === 'categories' ? 'active' : ''}`}
            onClick={() => setCurrentPage('categories')}
          >
            📁 分类管理
          </button>
          <button
            className={`nav-item ${currentPage === 'tags' ? 'active' : ''}`}
            onClick={() => setCurrentPage('tags')}
          >
            🏷️ 标签管理
          </button>
        </nav>
      </aside>

      {/* 主内容区 */}
      <main className="main-content">
        <header className="top-bar">
          <h2 className="page-title">
            {currentPage === 'dashboard' && '仪表盘'}
            {currentPage === 'articles' && '文章管理'}
            {currentPage === 'categories' && '分类管理'}
            {currentPage === 'tags' && '标签管理'}
          </h2>
          <button onClick={loadData} disabled={loading}>
            {loading ? '加载中...' : '🔄 刷新'}
          </button>
        </header>

        {error && (
          <div className="error-message">
            ❌ {error}
          </div>
        )}

        {renderPage()}
      </main>
    </div>
  )
}

// 仪表盘组件
interface DashboardProps {
  articles: Article[]
  categories: Category[]
  tags: Tag[]
}

function Dashboard({ articles, categories, tags }: DashboardProps) {
  const totalViews = articles.reduce((sum, article) => sum + (article.viewCount || 0), 0)

  return (
    <div className="dashboard">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📝</div>
          <div className="stat-info">
            <div className="stat-value">{articles.length}</div>
            <div className="stat-label">文章总数</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">👁</div>
          <div className="stat-info">
            <div className="stat-value">{totalViews}</div>
            <div className="stat-label">总阅读量</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📁</div>
          <div className="stat-info">
            <div className="stat-value">{categories.length}</div>
            <div className="stat-label">分类数量</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🏷️</div>
          <div className="stat-info">
            <div className="stat-value">{tags.length}</div>
            <div className="stat-label">标签数量</div>
          </div>
        </div>
      </div>

      {/* 最新文章 */}
      <div className="section">
        <h3>最新文章</h3>
        {articles.length === 0 ? (
          <p className="empty-state">暂无文章</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>标题</th>
                <th>分类</th>
                <th>阅读量</th>
                <th>创建时间</th>
              </tr>
            </thead>
            <tbody>
              {articles.slice(0, 5).map(article => (
                <tr key={article.id}>
                  <td>{article.title}</td>
                  <td>{article.category?.name || '-'}</td>
                  <td>{article.viewCount || 0}</td>
                  <td>
                    {article.createTime 
                      ? new Date(article.createTime).toLocaleDateString('zh-CN')
                      : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

// 文章管理页面
interface ArticlesPageProps {
  articles: Article[]
  setArticles: (articles: Article[]) => void
  categories: Category[]
  tags: Tag[]
}

function ArticlesPage({ articles, setArticles, categories, tags }: ArticlesPageProps) {
  const [showForm, setShowForm] = useState(false)
  const [editingArticle, setEditingArticle] = useState<Article | null>(null)
  const [filterCategory, setFilterCategory] = useState<number | null>(null)
  const [filterTag, setFilterTag] = useState<number | null>(null)
  const [previewArticle, setPreviewArticle] = useState<Article | null>(null)

  // 筛选后的文章列表
  const filteredArticles = articles.filter(article => {
    if (filterCategory && article.categoryId !== filterCategory) return false
    if (filterTag && !article.tags?.some(t => t.id === filterTag)) return false
    return true
  })

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这篇文章吗？')) return

    try {
      await adminApi.articles.delete(id)
      setArticles(articles.filter(a => a.id !== id))
    } catch (err) {
      alert('删除失败')
      console.error('Error deleting article:', err)
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div className="filter-row">
          <button 
            className="btn-primary"
            onClick={() => {
              setEditingArticle(null)
              setShowForm(!showForm)
            }}
          >
            {showForm ? '取消' : '+ 新建文章'}
          </button>
          
          <div className="filters">
            <select
              value={filterCategory || ''}
              onChange={(e) => setFilterCategory(e.target.value ? Number(e.target.value) : null)}
            >
              <option value="">全部分类</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            
            <select
              value={filterTag || ''}
              onChange={(e) => setFilterTag(e.target.value ? Number(e.target.value) : null)}
            >
              <option value="">全部标签</option>
              {tags.map(tag => (
                <option key={tag.id} value={tag.id}>{tag.name}</option>
              ))}
            </select>
            
            {(filterCategory || filterTag) && (
              <button 
                className="btn-clear-filter"
                onClick={() => {
                  setFilterCategory(null)
                  setFilterTag(null)
                }}
              >
                清除筛选
              </button>
            )}
          </div>
        </div>
      </div>

      {showForm && (
        <ArticleForm 
          article={editingArticle}
          categories={categories}
          tags={tags}
          onSuccess={() => {
            setShowForm(false)
            window.location.reload()
          }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Markdown 预览弹窗 */}
      {previewArticle && (
        <div className="preview-modal" onClick={() => setPreviewArticle(null)}>
          <div className="preview-content" onClick={(e) => e.stopPropagation()}>
            <div className="preview-header">
              <h3>{previewArticle.title}</h3>
              <button className="btn-close" onClick={() => setPreviewArticle(null)}>×</button>
            </div>
            <div className="preview-body">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {previewArticle.content || ''}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      )}

      {filteredArticles.length === 0 ? (
        <p className="empty-state">
          {articles.length === 0 ? '暂无文章' : '没有符合条件的文章'}
        </p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>标题</th>
              <th>分类</th>
              <th>标签</th>
              <th>状态</th>
              <th>阅读量</th>
              <th>创建时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {filteredArticles.map(article => (
              <tr key={article.id}>
                <td>{article.id}</td>
                <td>{article.title}</td>
                <td>{article.category?.name || '-'}</td>
                <td>
                  <div className="article-tags">
                    {article.tags && article.tags.length > 0 ? (
                      article.tags.map(tag => (
                        <span key={tag.id} className="article-tag">{tag.name}</span>
                      ))
                    ) : (
                      <span className="no-tag">-</span>
                    )}
                  </div>
                </td>
                <td>
                  <span className={`status-badge ${article.status === 1 ? 'published' : 'draft'}`}>
                    {article.status === 1 ? '已发布' : '草稿'}
                  </span>
                </td>
                <td>{article.viewCount || 0}</td>
                <td>
                  {article.createTime 
                    ? new Date(article.createTime).toLocaleString('zh-CN')
                    : '-'}
                </td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="btn-preview"
                      onClick={() => setPreviewArticle(article)}
                    >
                      预览
                    </button>
                    <button 
                      className="btn-edit"
                      onClick={() => {
                        setEditingArticle(article)
                        setShowForm(true)
                      }}
                    >
                      编辑
                    </button>
                    <button 
                      className="btn-delete"
                      onClick={() => handleDelete(article.id!)}
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

// 文章表单
interface ArticleFormProps {
  article?: Article | null
  categories: Category[]
  tags: Tag[]
  onSuccess: () => void
  onCancel: () => void
}

function ArticleForm({ article, categories, tags, onSuccess, onCancel }: ArticleFormProps) {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const requestData: ArticleRequest = {
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
        <textarea
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          rows={12}
          required
          placeholder="支持 Markdown 格式"
        />
      </div>

      <div className="form-group">
        <label>封面图片 URL</label>
        <input
          type="url"
          value={formData.coverImage || ''}
          onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
          placeholder="https://example.com/image.jpg"
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

// 分类管理页面
interface CategoriesPageProps {
  categories: Category[]
  setCategories: (categories: Category[]) => void
}

function CategoriesPage({ categories, setCategories }: CategoriesPageProps) {
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
        <p className="empty-state">暂无分类</p>
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

// 分类表单
interface CategoryFormProps {
  category?: Category | null
  onSuccess: () => void
  onCancel: () => void
}

function CategoryForm({ category, onSuccess, onCancel }: CategoryFormProps) {
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

// 标签管理页面
interface TagsPageProps {
  tags: Tag[]
  setTags: (tags: Tag[]) => void
}

function TagsPage({ tags, setTags }: TagsPageProps) {
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
        <p className="empty-state">暂无标签</p>
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

// 标签表单
interface TagFormProps {
  tag?: Tag | null
  onSuccess: () => void
  onCancel: () => void
}

function TagForm({ tag, onSuccess, onCancel }: TagFormProps) {
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

export default App

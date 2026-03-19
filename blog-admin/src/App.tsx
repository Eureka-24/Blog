import { useState, useEffect } from 'react'
import { adminApi } from './lib/api'
import type { Article, ArticleRequest, Category, Tag, Comment } from './types'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import LoginPage from './components/LoginPage'
import './App.css'

type Page = 'dashboard' | 'articles' | 'categories' | 'tags' | 'comments'

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard')
  const [articles, setArticles] = useState<Article[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // 登录状态
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)

  // 检查登录状态
  useEffect(() => {
    const token = localStorage.getItem('token')
    const user = localStorage.getItem('user')
    if (token && user) {
      setIsAuthenticated(true)
      setCurrentUser(JSON.parse(user))
    }
  }, [])

  // 加载数据函数
  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [articlesRes, categoriesRes, tagsRes, commentsRes] = await Promise.all([
        adminApi.articles.getAll(),
        adminApi.categories.getAll(),
        adminApi.tags.getAll(),
        adminApi.comments.getAll(),
      ])
      setArticles(articlesRes || [])
      setCategories(categoriesRes || [])
      setTags(tagsRes || [])
      setComments(commentsRes || [])
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '加载数据失败'
      setError(errorMsg)
      console.error('Error loading data:', err)
    } finally {
      setLoading(false)
    }
  }

  // 只有在已登录状态下才加载数据（必须在条件返回之前）
  useEffect(() => {
    if (isAuthenticated) {
      loadData()
    }
  }, [isAuthenticated])

  // 登录成功回调
  const handleLoginSuccess = (user: any, token: string) => {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    setIsAuthenticated(true)
    setCurrentUser(user)
  }

  // 退出登录
  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setIsAuthenticated(false)
    setCurrentUser(null)
    // 清空数据
    setArticles([])
    setCategories([])
    setTags([])
    setComments([])
    setError(null)
  }

  // 未登录时显示登录页面
  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />
  }

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
      case 'comments':
        return <CommentsPage comments={comments} setComments={setComments} articles={articles} />
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
          <div className="user-info">
            <span className="user-name">👤 {currentUser?.nickname || currentUser?.username}</span>
            <button className="logout-btn" onClick={handleLogout}>
              退出
            </button>
          </div>
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
          <button
            className={`nav-item ${currentPage === 'comments' ? 'active' : ''}`}
            onClick={() => setCurrentPage('comments')}
          >
            💬 评论管理
          </button>
        </nav>
        <div className="sidebar-footer">
          <a
            className="nav-item nav-link"
            href={import.meta.env.VITE_WEB_URL || 'http://localhost:3000'}
            target="_blank"
            rel="noopener noreferrer"
          >
            🌐 前往前台
          </a>
        </div>
      </aside>

      {/* 主内容区 */}
      <main className="main-content">
        <header className="top-bar">
          <h2 className="page-title">
            {currentPage === 'dashboard' && '仪表盘'}
            {currentPage === 'articles' && '文章管理'}
            {currentPage === 'categories' && '分类管理'}
            {currentPage === 'tags' && '标签管理'}
            {currentPage === 'comments' && '评论管理'}
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

// 评论管理页面
interface CommentsPageProps {
  comments: Comment[]
  setComments: (comments: Comment[]) => void
  articles: Article[]
}

function CommentsPage({ comments, setComments, articles }: CommentsPageProps) {
  const [expandedArticles, setExpandedArticles] = useState<Set<number>>(new Set())

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这条评论吗？')) return

    try {
      await adminApi.comments.delete(id)
      setComments(comments.filter(c => c.id !== id))
    } catch (err) {
      alert('删除失败')
      console.error('Error deleting comment:', err)
    }
  }

  const toggleArticle = (articleId: number) => {
    const newExpanded = new Set(expandedArticles)
    if (newExpanded.has(articleId)) {
      newExpanded.delete(articleId)
    } else {
      newExpanded.add(articleId)
    }
    setExpandedArticles(newExpanded)
  }

  // 按文章分组评论
  const groupedComments = comments.reduce((acc, comment) => {
    const articleId = comment.articleId
    if (!acc[articleId]) {
      acc[articleId] = []
    }
    acc[articleId].push(comment)
    return acc
  }, {} as Record<number, Comment[]>)

  // 构建树形结构
  const buildCommentTree = (comments: Comment[]) => {
    const commentMap = new Map<number, Comment & { children: Comment[] }>()
    const rootComments: (Comment & { children: Comment[] })[] = []

    // 初始化所有评论
    comments.forEach(comment => {
      commentMap.set(comment.id!, { ...comment, children: [] })
    })

    // 构建父子关系
    comments.forEach(comment => {
      const node = commentMap.get(comment.id!)!
      if (comment.parentId) {
        const parent = commentMap.get(comment.parentId)
        if (parent) {
          parent.children.push(node)
        } else {
          // 父评论不存在，作为根评论
          rootComments.push(node)
        }
      } else {
        rootComments.push(node)
      }
    })

    return rootComments
  }

  // 转换为数组并排序
  const articlesWithComments = Object.entries(groupedComments).map(([articleId, comments]) => ({
    article: articles.find(a => a.id === Number(articleId)),
    comments,
    rootComments: buildCommentTree(comments), // 构建树形结构
    articleId: Number(articleId),
  })).filter(item => item.article).sort((a, b) => {
    // 按文章创建时间倒序
    const dateA = a.article?.createTime ? new Date(a.article.createTime).getTime() : 0
    const dateB = b.article?.createTime ? new Date(b.article.createTime).getTime() : 0
    return dateB - dateA
  })

  // 展开所有文章
  const expandAll = () => {
    setExpandedArticles(new Set(articlesWithComments.map(item => item.articleId)))
  }

  // 收起所有文章
  const collapseAll = () => {
    setExpandedArticles(new Set())
  }

  return (
    <div className="page">
      {comments.length === 0 ? (
        <p className="empty-state">暂无评论</p>
      ) : (
        <div className="comments-grouped-view">
          {/* 操作按钮 */}
          <div className="group-actions mb-4">
            <button 
              className="btn-expand-all mr-2"
              onClick={expandAll}
            >
              📖 展开全部
            </button>
            <button 
              className="btn-collapse-all"
              onClick={collapseAll}
            >
              📕 收起全部
            </button>
            <span className="total-comments ml-4">
              共 {articlesWithComments.length} 篇文章，{comments.length} 条评论
            </span>
          </div>

          {/* 文章列表 */}
          {articlesWithComments.map(({ articleId, article, comments: articleComments, rootComments }) => (
            <div key={articleId} className="article-comment-group mb-4">
              {/* 文章标题栏（可点击展开/收起） */}
              <div 
                className="article-header cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleArticle(articleId)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <span className="expand-icon">
                      {expandedArticles.has(articleId) ? '▼' : '▶'}
                    </span>
                    <span className="article-title-text font-medium">
                      {article?.title || `文章 ID: ${articleId}`}
                    </span>
                    <span className="comment-count-badge">
                      {articleComments.length} 条评论
                    </span>
                  </div>
                  <div className="article-meta text-sm text-gray-500">
                    {article?.category && (
                      <span className="mr-3">📁 {article.category.name}</span>
                    )}
                    <span>
                      {article?.createTime 
                        ? new Date(article.createTime).toLocaleDateString('zh-CN')
                        : '-'}
                    </span>
                  </div>
                </div>
              </div>

              {/* 评论列表（展开时显示） */}
              {expandedArticles.has(articleId) && (
                <div className="comments-table-container mt-2">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th style={{ width: '60px' }}>ID</th>
                        <th>作者</th>
                        <th>内容</th>
                        <th style={{ width: '120px' }}>IP</th>
                        <th style={{ width: '160px' }}>创建时间</th>
                        <th style={{ width: '100px' }}>操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* 渲染根评论及其回复 - 现在显示所有评论 */}
                      {(() => {
                        const renderCommentWithReplies = (
                          rootComment: Comment
                        ): any => {
                          // 找到该根评论下的所有回复（按时间排序）
                          const replies = articleComments.filter(c => 
                            c.rootId === rootComment.id && c.id !== rootComment.id
                          ).sort((a, b) => 
                            new Date(a.createTime!).getTime() - new Date(b.createTime!).getTime()
                          );

                          return (
                            <>
                              {/* 根评论 */}
                              <tr key={rootComment.id} style={{ background: 'white' }}>
                                <td>
                                  <span style={{ paddingLeft: '0px' }}>
                                    {rootComment.id}
                                  </span>
                                </td>
                                <td>
                                  <div className="author-info">
                                    <div className="author-name">{rootComment.authorName}</div>
                                    {rootComment.authorEmail && (
                                      <div className="author-email">{rootComment.authorEmail}</div>
                                    )}
                                  </div>
                                </td>
                                <td className="comment-content">{rootComment.content}</td>
                                <td className="ip-address">{rootComment.ip || '-'}</td>
                                <td>
                                  {rootComment.createTime 
                                    ? new Date(rootComment.createTime).toLocaleString('zh-CN')
                                    : '-'}
                                </td>
                                <td>
                                  <div className="action-buttons">
                                    <button 
                                      className="btn-delete"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handleDelete(rootComment.id!)
                                      }}
                                    >
                                      删除
                                    </button>
                                  </div>
                                </td>
                              </tr>
                              {/* 所有回复（包括子评论的回复） */}
                              {replies.map(reply => (
                                <tr key={reply.id} style={{ background: '#f9fafb' }}>
                                  <td>
                                    <span style={{ paddingLeft: '20px' }}>
                                      <span className="text-gray-400 mr-1">↳</span>
                                      {reply.id}
                                    </span>
                                  </td>
                                  <td>
                                    <div className="author-info">
                                      <div className="author-name">{reply.authorName}</div>
                                      {reply.authorEmail && (
                                        <div className="author-email">{reply.authorEmail}</div>
                                      )}
                                      {/* 显示回复对象 */}
                                      {reply.parentId && (
                                        <div className="reply-badge text-xs text-gray-500 mt-1">
                                          回复 @{articleComments.find(c => c.id === reply.parentId)?.authorName || '用户'}
                                        </div>
                                      )}
                                    </div>
                                  </td>
                                  <td className="comment-content">{reply.content}</td>
                                  <td className="ip-address">{reply.ip || '-'}</td>
                                  <td>
                                    {reply.createTime 
                                      ? new Date(reply.createTime).toLocaleString('zh-CN')
                                      : '-'}
                                  </td>
                                  <td>
                                    <div className="action-buttons">
                                      <button 
                                        className="btn-delete"
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          handleDelete(reply.id!)
                                        }}
                                      >
                                        删除
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </>
                          );
                        };

                        return rootComments.map(root => 
                          renderCommentWithReplies(root)
                        );
                      })()}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default App

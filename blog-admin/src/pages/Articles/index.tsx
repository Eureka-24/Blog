import { useState, useEffect } from 'react'
import { adminApi } from '../../lib/api'
import type { Article, Category, Tag, PageResponse } from '../../types'
import { EmptyState, Pagination } from '../../components/common'
import ArticleForm from './ArticleForm'
import ArticlePreview from './ArticlePreview'

interface ArticlesPageProps {
  categories: Category[]
  tags: Tag[]
}

export default function ArticlesPage({ categories, tags }: ArticlesPageProps) {
  const [articles, setArticles] = useState<Article[]>([])
  const [pageData, setPageData] = useState<PageResponse<Article> | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)
  const [, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingArticle, setEditingArticle] = useState<Article | null>(null)
  const [filterCategory, setFilterCategory] = useState<number | null>(null)
  const [filterTag, setFilterTag] = useState<number | null>(null)
  const [previewArticle, setPreviewArticle] = useState<Article | null>(null)

  // 加载文章数据
  const loadArticles = async () => {
    setLoading(true)
    try {
      const response = await adminApi.articles.getAll(currentPage, pageSize, filterCategory || undefined, filterTag || undefined)
      setArticles(response.records)
      setPageData(response)
    } catch (err) {
      console.error('Error loading articles:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadArticles()
  }, [currentPage, filterCategory, filterTag])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const filteredArticles = articles

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这篇文章吗？')) return

    try {
      await adminApi.articles.delete(id)
      loadArticles()
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
              onChange={(e) => {
                setFilterCategory(e.target.value ? Number(e.target.value) : null)
                setCurrentPage(1)
              }}
            >
              <option value="">全部分类</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            
            <select
              value={filterTag || ''}
              onChange={(e) => {
                setFilterTag(e.target.value ? Number(e.target.value) : null)
                setCurrentPage(1)
              }}
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
                  setCurrentPage(1)
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
            loadArticles()
          }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {previewArticle && (
        <ArticlePreview article={previewArticle} onClose={() => setPreviewArticle(null)} />
      )}

      {filteredArticles.length === 0 ? (
        <EmptyState message={articles.length === 0 ? '暂无文章' : '没有符合条件的文章'} />
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

      {pageData && <Pagination page={pageData} onPageChange={handlePageChange} />}
    </div>
  )
}

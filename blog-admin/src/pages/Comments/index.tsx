import { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { adminApi } from '../../lib/api'
import type { Comment, Article, PageResponse } from '../../types'
import { EmptyState, Pagination } from '../../components/common'

// 文章评论分组数据
interface ArticleCommentsGroup {
  article: Article
  comments: Comment[]
  totalComments: number
  currentPage: number
  pageData: PageResponse<Comment> | null
  expanded: boolean
}

export default function CommentsPage() {
  // 第一级：文章列表分页
  const [articles, setArticles] = useState<Article[]>([])
  const [articlesPageData, setArticlesPageData] = useState<PageResponse<Article> | null>(null)
  const [articlesCurrentPage, setArticlesCurrentPage] = useState(1)
  const [articlesPageSize] = useState(5)
  const [, setLoading] = useState(false)
  
  // 文章评论分组数据
  const [articleGroups, setArticleGroups] = useState<Map<number, ArticleCommentsGroup>>(new Map())

  // 加载文章列表（第一级）
  const loadArticles = async () => {
    setLoading(true)
    try {
      const response = await adminApi.articles.getAll(articlesCurrentPage, articlesPageSize)
      setArticles(response.records)
      setArticlesPageData(response)
      
      // 初始化文章分组数据
      const newGroups = new Map<number, ArticleCommentsGroup>()
      response.records.forEach(article => {
        if (!article.id) return
        newGroups.set(article.id, {
          article,
          comments: [],
          totalComments: 0,
          currentPage: 1,
          pageData: null,
          expanded: false
        })
      })
      setArticleGroups(newGroups)
    } catch (err) {
      console.error('Error loading articles:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadArticles()
  }, [articlesCurrentPage])

  // 展平所有评论（包括嵌套的回复）
  const flattenComments = (comments: Comment[]): Comment[] => {
    const result: Comment[] = []
    const traverse = (comment: Comment, depth: number = 0) => {
      // 添加深度标记用于UI展示
      const commentWithDepth = { ...comment, depth }
      result.push(commentWithDepth)
      // 递归处理子评论
      if (comment.children && comment.children.length > 0) {
        comment.children.forEach(child => traverse(child, depth + 1))
      }
    }
    comments.forEach(comment => traverse(comment, 0))
    return result
  }

  // 加载指定文章的评论（第二级）
  const loadArticleComments = async (articleId: number, page: number = 1) => {
    const group = articleGroups.get(articleId)
    if (!group) return

    try {
      // 获取该文章的所有评论（包含嵌套结构）
      const response = await adminApi.comments.getByArticle(articleId)
      
      // 展平所有评论（包括回复的回复）
      const allComments = flattenComments(response)
      
      // 手动分页
      const pageSize = 10
      const total = allComments.length
      const pages = Math.ceil(total / pageSize)
      const start = (page - 1) * pageSize
      const end = start + pageSize
      const paginatedComments = allComments.slice(start, end)
      
      const pageData: PageResponse<Comment> = {
        records: paginatedComments,
        total,
        size: pageSize,
        current: page,
        pages
      }

      setArticleGroups(prev => {
        const newGroups = new Map(prev)
        newGroups.set(articleId, {
          ...group,
          comments: paginatedComments,
          totalComments: total,
          currentPage: page,
          pageData
        })
        return newGroups
      })
    } catch (err) {
      console.error('Error loading comments for article', articleId, err)
    }
  }

  // 切换文章展开/折叠
  const toggleArticleExpand = async (articleId: number) => {
    const group = articleGroups.get(articleId)
    if (!group) return

    const newExpanded = !group.expanded
    
    setArticleGroups(prev => {
      const newGroups = new Map(prev)
      newGroups.set(articleId, { ...group, expanded: newExpanded })
      return newGroups
    })

    // 展开时加载评论
    if (newExpanded && group.comments.length === 0) {
      await loadArticleComments(articleId, 1)
    }
  }

  // 文章分页切换
  const handleArticlesPageChange = (page: number) => {
    setArticlesCurrentPage(page)
  }

  // 评论分页切换
  const handleCommentsPageChange = (articleId: number, page: number) => {
    loadArticleComments(articleId, page)
  }

  const handleDelete = async (articleId: number, commentId: number) => {
    if (!confirm('确定要删除这条评论吗？')) return

    try {
      await adminApi.comments.delete(commentId)
      // 重新加载该文章的评论
      const group = articleGroups.get(articleId)
      if (group) {
        await loadArticleComments(articleId, group.currentPage)
      }
    } catch (err) {
      alert('删除失败')
      console.error('Error deleting comment:', err)
    }
  }

  return (
    <div className="page">
      {articles.length === 0 ? (
        <EmptyState message="暂无文章" />
      ) : (
        <>
          <div className="comments-grouped-view">
            {articles.map(article => {
              if (!article.id) return null
              const group = articleGroups.get(article.id)
              if (!group) return null

              return (
                <div key={article.id} className="article-comment-group">
                  {/* 文章标题栏（可点击折叠） */}
                  <div 
                    className="article-header cursor-pointer"
                    onClick={() => article.id && toggleArticleExpand(article.id)}
                  >
                    <div className="article-meta">
                      <span className="expand-icon">
                        {group.expanded ? '▼' : '▶'}
                      </span>
                      <span className="article-title-text">{article.title}</span>
                      <span className="comment-count-badge">
                        {group.expanded 
                          ? (group.totalComments > 0 ? `${group.totalComments}条评论` : '暂无评论')
                          : '点击展开'
                        }
                      </span>
                    </div>
                  </div>

                  {/* 评论列表（展开时显示） */}
                  {group.expanded && (
                    <div className="comments-table-container">
                      {group.comments.length === 0 ? (
                        <EmptyState message="该文章暂无评论" />
                      ) : (
                        <>
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
                              {group.comments.map((comment: Comment & { depth?: number }) => (
                                <tr key={comment.id} style={{ backgroundColor: comment.depth && comment.depth > 0 ? '#f5f7fa' : 'transparent' }}>
                                  <td>{comment.id}</td>
                                  <td>
                                    <div className="author-info">
                                      <div>
                                        {comment.depth && comment.depth > 0 && (
                                          <span style={{ marginRight: '8px', color: '#909399' }}>
                                            {'└'.repeat(comment.depth) + ' '}
                                          </span>
                                        )}
                                        {comment.authorName}
                                      </div>
                                      {comment.authorEmail && (
                                        <div className="author-email">{comment.authorEmail}</div>
                                      )}
                                    </div>
                                  </td>
                                  <td>
                                    <div className="comment-content markdown-content" title={comment.content}>
                                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {comment.content}
                                      </ReactMarkdown>
                                    </div>
                                  </td>
                                  <td>
                                    <span className="ip-address">{comment.ip || '-'}</span>
                                  </td>
                                  <td>
                                    {comment.createTime 
                                      ? new Date(comment.createTime).toLocaleString('zh-CN')
                                      : '-'}
                                  </td>
                                  <td>
                                    <div className="action-buttons">
                                      <button 
                                        className="btn-delete"
                                        onClick={() => article.id && handleDelete(article.id, comment.id!)}
                                      >
                                        删除
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>

                          {group.pageData && group.pageData.pages > 1 && (
                            <Pagination 
                              page={group.pageData} 
                              onPageChange={(page) => article.id && handleCommentsPageChange(article.id, page)} 
                            />
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* 文章分页 */}
          {articlesPageData && articlesPageData.pages > 1 && (
            <Pagination 
              page={articlesPageData} 
              onPageChange={handleArticlesPageChange} 
            />
          )}
        </>
      )}
    </div>
  )
}

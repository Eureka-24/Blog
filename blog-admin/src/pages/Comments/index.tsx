import { useState } from 'react'
import { adminApi } from '../../lib/api'
import type { Comment, Article } from '../../types'
import { EmptyState } from '../../components/common'
import CommentRow from './CommentRow'

interface CommentsPageProps {
  comments: Comment[]
  setComments: (comments: Comment[]) => void
  articles: Article[]
}

export default function CommentsPage({ comments, setComments, articles }: CommentsPageProps) {
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

    comments.forEach(comment => {
      commentMap.set(comment.id!, { ...comment, children: [] })
    })

    comments.forEach(comment => {
      const node = commentMap.get(comment.id!)!
      if (comment.parentId) {
        const parent = commentMap.get(comment.parentId)
        if (parent) {
          parent.children.push(node)
        } else {
          rootComments.push(node)
        }
      } else {
        rootComments.push(node)
      }
    })

    return rootComments
  }

  const articlesWithComments = Object.entries(groupedComments).map(([articleId, comments]) => ({
    article: articles.find(a => a.id === Number(articleId)),
    comments,
    rootComments: buildCommentTree(comments),
    articleId: Number(articleId),
  })).filter(item => item.article).sort((a, b) => {
    const dateA = a.article?.createTime ? new Date(a.article.createTime).getTime() : 0
    const dateB = b.article?.createTime ? new Date(b.article.createTime).getTime() : 0
    return dateB - dateA
  })

  const expandAll = () => {
    setExpandedArticles(new Set(articlesWithComments.map(item => item.articleId)))
  }

  const collapseAll = () => {
    setExpandedArticles(new Set())
  }

  return (
    <div className="page">
      {comments.length === 0 ? (
        <EmptyState message="暂无评论" />
      ) : (
        <div className="comments-grouped-view">
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

          {articlesWithComments.map(({ articleId, article, comments: articleComments, rootComments }) => (
            <div key={articleId} className="article-comment-group mb-4">
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
                      {rootComments.map(root => (
                        <CommentRow
                          key={root.id}
                          comment={root}
                          allComments={articleComments}
                          onDelete={handleDelete}
                        />
                      ))}
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

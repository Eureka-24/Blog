import { useState, useEffect } from 'react'
import { adminApi } from '../../lib/api'
import type { Comment, PageResponse } from '../../types'
import { EmptyState, Pagination } from '../../components/common'

export default function CommentsPage() {
  const [comments, setComments] = useState<Comment[]>([])
  const [pageData, setPageData] = useState<PageResponse<Comment> | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)
  const [loading, setLoading] = useState(false)

  // 加载评论数据
  const loadComments = async () => {
    setLoading(true)
    try {
      const response = await adminApi.comments.getAll(currentPage, pageSize)
      setComments(response.records)
      setPageData(response)
    } catch (err) {
      console.error('Error loading comments:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadComments()
  }, [currentPage])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这条评论吗？')) return

    try {
      await adminApi.comments.delete(id)
      loadComments()
    } catch (err) {
      alert('删除失败')
      console.error('Error deleting comment:', err)
    }
  }

  return (
    <div className="page">
      {comments.length === 0 ? (
        <EmptyState message="暂无评论" />
      ) : (
        <>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '60px' }}>ID</th>
                <th style={{ width: '80px' }}>文章ID</th>
                <th>作者</th>
                <th>内容</th>
                <th style={{ width: '120px' }}>IP</th>
                <th style={{ width: '160px' }}>创建时间</th>
                <th style={{ width: '100px' }}>操作</th>
              </tr>
            </thead>
            <tbody>
              {comments.map(comment => (
                <tr key={comment.id}>
                  <td>{comment.id}</td>
                  <td>{comment.articleId}</td>
                  <td>
                    <div className="author-info">
                      <div>{comment.authorName}</div>
                      {comment.authorEmail && (
                        <div className="author-email">{comment.authorEmail}</div>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="comment-content" title={comment.content}>
                      {comment.content}
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
                        onClick={() => handleDelete(comment.id!)}
                      >
                        删除
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {pageData && <Pagination page={pageData} onPageChange={handlePageChange} />}
        </>
      )}
    </div>
  )
}

'use client'

import { useState, useEffect, useMemo } from 'react'
import { commentApi } from '@/lib/api'
import type { Comment, User } from '@/types'

interface CommentSectionProps {
  articleId: number
  currentUser: User | null
  onShowLogin: () => void
}

export default function CommentSection({ articleId, currentUser, onShowLogin }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState({
    authorName: '',
    authorEmail: '',
    content: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [replyTo, setReplyTo] = useState<{ id: number; authorName: string } | null>(null)
  const [placeholder, setPlaceholder] = useState('写下你的评论...')

  // 加载评论
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const commentsData = await commentApi.getByArticle(articleId)
        setComments(commentsData || [])
      } catch (err) {
        console.error('Error fetching comments:', err)
      }
    }
    fetchComments()
  }, [articleId])

  // 自动填充已登录用户的名称和邮箱
  useEffect(() => {
    if (currentUser) {
      setNewComment(prev => ({
        ...prev,
        authorName: currentUser.nickname || currentUser.username,
        authorEmail: currentUser.email,
      }))
    }
  }, [currentUser])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newComment.authorName || !newComment.content) {
      alert('请填写昵称和评论内容')
      return
    }

    setSubmitting(true)
    try {
      // 找到根评论的 ID
      let rootIdValue: number | undefined = undefined
      if (replyTo) {
        const repliedComment = comments.find(c => c.id === replyTo.id)
        if (repliedComment) {
          rootIdValue = repliedComment.rootId || repliedComment.parentId || repliedComment.id
        }
      }

      const commentData = {
        articleId,
        parentId: replyTo?.id || undefined,
        rootId: rootIdValue,
        authorName: newComment.authorName,
        authorEmail: newComment.authorEmail || undefined,
        content: newComment.content,
      }

      await commentApi.create(commentData)
      
      // 重新加载评论
      const updatedComments = await commentApi.getByArticle(articleId)
      setComments(updatedComments || [])
      
      // 清空表单并重置状态
      setNewComment({
        authorName: '',
        authorEmail: '',
        content: '',
      })
      setReplyTo(null)
      setPlaceholder('写下你的评论...')
      
      alert('评论成功！')
    } catch (err) {
      console.error('Error submitting comment:', err)
      alert('评论失败，请稍后重试')
    } finally {
      setSubmitting(false)
    }
  }

  const handleReplyClick = (commentId: number, authorName: string) => {
    setReplyTo({ id: commentId, authorName })
    setPlaceholder(`回复 @${authorName} 的消息`)
  }

  const cancelReply = () => {
    setReplyTo(null)
    setPlaceholder('写下你的评论...')
  }

  const formatTime = (timeString: string) => {
    const date = new Date(timeString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return '刚刚'
    if (minutes < 60) return `${minutes}分钟前`
    if (hours < 24) return `${hours}小时前`
    if (days < 7) return `${days}天前`
    return date.toLocaleDateString('zh-CN')
  }

  // 构建包含所有评论的扁平 Map
  const allCommentsMap = useMemo(() => {
    const map = new Map<number, Comment>()
    comments.forEach(c => {
      map.set(c.id, c)
      if (c.children) {
        c.children.forEach(child => map.set(child.id, child))
      }
    })
    return map
  }, [comments])

  // 渲染评论及其所有回复
  const renderComment = (comment: Comment, isReply: boolean = false) => {
    const getRepliedAuthor = (parentId: number | undefined): string => {
      if (!parentId) return ''
      const parentComment = allCommentsMap.get(parentId)
      return parentComment ? parentComment.authorName : '用户'
    }

    if (!comment || !comment.authorName) {
      return null
    }

    return (
      <div 
        key={comment.id} 
        className={`border-b pb-4 last:border-b-0 ${isReply ? 'ml-12 mt-4' : ''}`}
      >
        <div className="flex items-start gap-3">
          <div className={`rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 ${isReply ? 'w-8 h-8' : 'w-10 h-10'}`}>
            <span className={`text-blue-600 font-bold ${isReply ? 'text-sm' : ''}`}>
              {comment.authorName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <div>
                <span className="font-medium text-gray-900">{comment.authorName}</span>
                {comment.authorWebsite && (
                  <a 
                    href={comment.authorWebsite} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="ml-2 text-sm text-blue-600 hover:underline"
                  >
                    🌐 个人网站
                  </a>
                )}
                {comment.parentId && comment.parentId > 0 && (
                  <span className="ml-2 text-xs text-gray-500">
                    回复 @{getRepliedAuthor(comment.parentId)}
                  </span>
                )}
              </div>
              <span className="text-sm text-gray-500">{formatTime(comment.createTime)}</span>
            </div>
            <p className="text-gray-700">{comment.content}</p>
            <button
              onClick={() => handleReplyClick(comment.id!, comment.authorName)}
              className="mt-2 text-sm text-blue-600 hover:text-blue-700"
            >
              💬 回复
            </button>
          </div>
        </div>
        
        {comment.children && comment.children.length > 0 && (
          <div className="mt-2">
            {comment.children.map(reply => renderComment(reply, true))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">评论</h2>

      {/* 评论列表 */}
      {comments.length === 0 ? (
        <p className="text-gray-500 text-center py-8">暂无评论，快来抢沙发吧！</p>
      ) : (
        <div className="space-y-6 mb-8">
          {comments
            .filter(comment => !comment.parentId)
            .map(comment => renderComment(comment))
          }
        </div>
      )}

      {/* 评论表单 */}
      <form onSubmit={handleSubmit} className="border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">发表评论</h3>
        
        {!currentUser ? (
          <div className="text-center py-6">
            <p className="text-gray-500 mb-4">登录后可发表评论</p>
            <button
              type="button"
              onClick={onShowLogin}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              登录
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label htmlFor="authorName" className="block text-sm font-medium text-gray-700 mb-1">
                昵称
              </label>
              <input
                type="text"
                id="authorName"
                value={newComment.authorName}
                readOnly
                className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label htmlFor="authorEmail" className="block text-sm font-medium text-gray-700 mb-1">
                邮箱
              </label>
              <input
                type="email"
                id="authorEmail"
                value={newComment.authorEmail}
                readOnly
                className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                评论内容 *
              </label>
              <textarea
                id="content"
                value={newComment.content}
                onChange={(e) => setNewComment({ ...newComment, content: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
                placeholder={placeholder}
                required
              />
              {replyTo && (
                <button
                  type="button"
                  onClick={cancelReply}
                  className="mt-2 text-sm text-gray-600 hover:text-gray-800"
                >
                  ✕ 取消回复
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {submitting ? '提交中...' : '发表评论'}
            </button>
          </div>
        )}
      </form>
    </div>
  )
}

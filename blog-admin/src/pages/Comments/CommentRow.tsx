import type { Comment } from '../../types'

interface CommentRowProps {
  comment: Comment
  allComments: Comment[]
  onDelete: (id: number) => void
  isReply?: boolean
}

export default function CommentRow({ comment, allComments, onDelete, isReply = false }: CommentRowProps) {
  // 找到该评论下的所有回复
  const replies = allComments.filter(c => 
    c.rootId === comment.id && c.id !== comment.id
  ).sort((a, b) => 
    new Date(a.createTime!).getTime() - new Date(b.createTime!).getTime()
  )

  return (
    <>
      <tr key={comment.id} style={{ background: isReply ? '#f9fafb' : 'white' }}>
        <td>
          <span style={{ paddingLeft: isReply ? '20px' : '0px' }}>
            {isReply && <span className="text-gray-400 mr-1">↳</span>}
            {comment.id}
          </span>
        </td>
        <td>
          <div className="author-info">
            <div className="author-name">{comment.authorName}</div>
            {comment.authorEmail && (
              <div className="author-email">{comment.authorEmail}</div>
            )}
            {isReply && comment.parentId && (
              <div className="reply-badge text-xs text-gray-500 mt-1">
                回复 @{allComments.find(c => c.id === comment.parentId)?.authorName || '用户'}
              </div>
            )}
          </div>
        </td>
        <td className="comment-content">{comment.content}</td>
        <td className="ip-address">{comment.ip || '-'}</td>
        <td>
          {comment.createTime 
            ? new Date(comment.createTime).toLocaleString('zh-CN')
            : '-'}
        </td>
        <td>
          <div className="action-buttons">
            <button 
              className="btn-delete"
              onClick={(e) => {
                e.stopPropagation()
                onDelete(comment.id!)
              }}
            >
              删除
            </button>
          </div>
        </td>
      </tr>
      {replies.map(reply => (
        <CommentRow 
          key={reply.id} 
          comment={reply} 
          allComments={allComments} 
          onDelete={onDelete}
          isReply={true}
        />
      ))}
    </>
  )
}

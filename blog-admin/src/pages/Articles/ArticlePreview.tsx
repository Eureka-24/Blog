import type { Article } from '../../types'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface ArticlePreviewProps {
  article: Article
  onClose: () => void
}

export default function ArticlePreview({ article, onClose }: ArticlePreviewProps) {
  return (
    <div className="preview-modal" onClick={onClose}>
      <div className="preview-content" onClick={(e) => e.stopPropagation()}>
        <div className="preview-header">
          <h3>{article.title}</h3>
          <button className="btn-close" onClick={onClose}>×</button>
        </div>
        <div className="preview-body">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {article.content || ''}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  )
}

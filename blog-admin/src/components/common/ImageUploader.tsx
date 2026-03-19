import { useState, useRef, useCallback } from 'react'
import { adminApi, getImageUrl } from '../../lib/api'
import type { Image } from '../../types'

interface ImageUploaderProps {
  articleId?: number
  onImageSelect?: (url: string) => void
  onCoverSelect?: (url: string) => void
  selectedCoverUrl?: string
}

export default function ImageUploader({ 
  articleId, 
  onImageSelect, 
  onCoverSelect,
  selectedCoverUrl 
}: ImageUploaderProps) {
  const [images, setImages] = useState<Image[]>([])
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 加载文章图片列表
  const loadImages = useCallback(async () => {
    if (!articleId) return
    setLoading(true)
    try {
      const data = await adminApi.images.getByArticle(articleId)
      setImages(data)
    } catch (err) {
      console.error('加载图片失败:', err)
    } finally {
      setLoading(false)
    }
  }, [articleId])

  // 组件挂载时加载图片
  useState(() => {
    loadImages()
  })

  // 处理文件上传
  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    
    setUploading(true)
    const uploadPromises = Array.from(files).map(async (file) => {
      try {
        const result = await adminApi.images.upload(file, articleId)
        return result
      } catch (err) {
        console.error('上传失败:', file.name, err)
        alert(`上传失败: ${file.name}`)
        return null
      }
    })

    const results = await Promise.all(uploadPromises)
    const successful = results.filter((r): r is Image => r !== null)
    
    if (successful.length > 0) {
      setImages(prev => [...successful, ...prev])
    }
    setUploading(false)
  }

  // 处理文件选择
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleUpload(e.target.files)
    // 清空 input 值，允许重复选择相同文件
    e.target.value = ''
  }

  // 处理拖拽
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    handleUpload(e.dataTransfer.files)
  }

  // 删除图片
  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('确定要删除这张图片吗？')) return
    
    try {
      await adminApi.images.delete(id)
      setImages(prev => prev.filter(img => img.id !== id))
    } catch (err) {
      console.error('删除失败:', err)
      alert('删除失败')
    }
  }

  // 复制图片URL
  const handleCopyUrl = async (image: Image, e: React.MouseEvent) => {
    e.stopPropagation()
    const url = getImageUrl(image.url || image.filePath) || ''
    try {
      await navigator.clipboard.writeText(url)
      alert('图片链接已复制到剪贴板')
    } catch {
      // 降级方案
      const textarea = document.createElement('textarea')
      textarea.value = url
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      alert('图片链接已复制到剪贴板')
    }
  }

  // 选择图片作为封面
  const handleSelectCover = (image: Image, e: React.MouseEvent) => {
    e.stopPropagation()
    const url = getImageUrl(image.url || image.filePath) || ''
    onCoverSelect?.(url)
  }

  // 选择图片插入文章
  const handleSelectImage = (image: Image) => {
    const url = getImageUrl(image.url || image.filePath) || ''
    onImageSelect?.(url)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  return (
    <div className="image-uploader">
      {/* 上传区域 */}
      <div
        className={`upload-area ${dragOver ? 'drag-over' : ''} ${uploading ? 'uploading' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          multiple
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
        <div className="upload-content">
          {uploading ? (
            <>
              <div className="spinner"></div>
              <span>上传中...</span>
            </>
          ) : (
            <>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <span>点击或拖拽上传图片</span>
              <small>支持 JPG/PNG/GIF/WebP，单张最大 5MB</small>
            </>
          )}
        </div>
      </div>

      {/* 图片列表 */}
      {articleId && (
        <div className="image-section">
          <div className="section-header">
            <h4>文章图片</h4>
            <button 
              type="button" 
              className="btn-refresh"
              onClick={loadImages}
              disabled={loading}
            >
              {loading ? '加载中...' : '刷新'}
            </button>
          </div>
          
          {images.length === 0 ? (
            <div className="empty-state">
              {loading ? '加载中...' : '暂无图片，请先上传'}
            </div>
          ) : (
            <div className="image-grid">
              {images.map(image => {
                const imageUrl = getImageUrl(image.thumbnailUrl || image.url || image.filePath)
                const isCover = selectedCoverUrl && (
                  selectedCoverUrl === image.url || 
                  selectedCoverUrl.includes(image.fileName || '')
                )
                
                return (
                  <div 
                    key={image.id} 
                    className={`image-item ${isCover ? 'is-cover' : ''}`}
                    onClick={() => handleSelectImage(image)}
                  >
                    <div className="image-preview">
                      <img 
                        src={imageUrl} 
                        alt={image.originalName}
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/favicon.svg'
                        }}
                      />
                      {isCover && <span className="cover-badge">封面</span>}
                    </div>
                    <div className="image-info">
                      <span className="image-name" title={image.originalName}>
                        {image.originalName}
                      </span>
                      <span className="image-size">
                        {formatFileSize(image.fileSize)}
                        {image.width && image.height && ` · ${image.width}×${image.height}`}
                      </span>
                    </div>
                    <div className="image-actions">
                      <button
                        type="button"
                        className="btn-action"
                        title="复制链接"
                        onClick={(e) => handleCopyUrl(image, e)}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                        </svg>
                      </button>
                      {onCoverSelect && (
                        <button
                          type="button"
                          className={`btn-action ${isCover ? 'active' : ''}`}
                          title={isCover ? '当前封面' : '设为封面'}
                          onClick={(e) => handleSelectCover(image, e)}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <polyline points="21 15 16 10 5 21" />
                          </svg>
                        </button>
                      )}
                      <button
                        type="button"
                        className="btn-action btn-delete"
                        title="删除"
                        onClick={(e) => handleDelete(image.id!, e)}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      <style>{`
        .image-uploader {
          margin-top: 1rem;
        }
        
        .upload-area {
          border: 2px dashed var(--border-color, #e2e8f0);
          border-radius: 8px;
          padding: 2rem;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s;
          background: var(--bg-secondary, #f8fafc);
        }
        
        .upload-area:hover,
        .upload-area.drag-over {
          border-color: var(--primary-color, #3b82f6);
          background: var(--primary-light, #eff6ff);
        }
        
        .upload-area.uploading {
          cursor: not-allowed;
          opacity: 0.7;
        }
        
        .upload-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          color: var(--text-secondary, #64748b);
        }
        
        .upload-content svg {
          opacity: 0.5;
        }
        
        .upload-content small {
          font-size: 0.75rem;
          opacity: 0.7;
        }
        
        .spinner {
          width: 24px;
          height: 24px;
          border: 2px solid var(--border-color, #e2e8f0);
          border-top-color: var(--primary-color, #3b82f6);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        .image-section {
          margin-top: 1.5rem;
        }
        
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }
        
        .section-header h4 {
          margin: 0;
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-primary, #1e293b);
        }
        
        .btn-refresh {
          padding: 0.25rem 0.75rem;
          font-size: 0.75rem;
          background: var(--bg-secondary, #f1f5f9);
          border: 1px solid var(--border-color, #e2e8f0);
          border-radius: 4px;
          cursor: pointer;
        }
        
        .btn-refresh:hover {
          background: var(--border-color, #e2e8f0);
        }
        
        .empty-state {
          padding: 2rem;
          text-align: center;
          color: var(--text-secondary, #94a3b8);
          font-size: 0.875rem;
          background: var(--bg-secondary, #f8fafc);
          border-radius: 8px;
        }
        
        .image-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          gap: 1rem;
        }
        
        .image-item {
          border: 1px solid var(--border-color, #e2e8f0);
          border-radius: 8px;
          overflow: hidden;
          cursor: pointer;
          transition: all 0.2s;
          background: white;
        }
        
        .image-item:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          transform: translateY(-2px);
        }
        
        .image-item.is-cover {
          border-color: var(--primary-color, #3b82f6);
          box-shadow: 0 0 0 2px var(--primary-light, #bfdbfe);
        }
        
        .image-preview {
          position: relative;
          aspect-ratio: 4/3;
          background: var(--bg-secondary, #f1f5f9);
          overflow: hidden;
        }
        
        .image-preview img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .cover-badge {
          position: absolute;
          top: 4px;
          left: 4px;
          background: var(--primary-color, #3b82f6);
          color: white;
          font-size: 0.625rem;
          padding: 2px 6px;
          border-radius: 4px;
          font-weight: 600;
        }
        
        .image-info {
          padding: 0.5rem;
        }
        
        .image-name {
          display: block;
          font-size: 0.75rem;
          color: var(--text-primary, #1e293b);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .image-size {
          display: block;
          font-size: 0.625rem;
          color: var(--text-secondary, #94a3b8);
          margin-top: 2px;
        }
        
        .image-actions {
          display: flex;
          gap: 0.25rem;
          padding: 0.5rem;
          padding-top: 0;
          border-top: 1px solid var(--border-color, #f1f5f9);
        }
        
        .btn-action {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0.375rem;
          background: transparent;
          border: 1px solid var(--border-color, #e2e8f0);
          border-radius: 4px;
          cursor: pointer;
          color: var(--text-secondary, #64748b);
          transition: all 0.2s;
        }
        
        .btn-action:hover {
          background: var(--bg-secondary, #f1f5f9);
          color: var(--text-primary, #1e293b);
        }
        
        .btn-action.active {
          background: var(--primary-color, #3b82f6);
          border-color: var(--primary-color, #3b82f6);
          color: white;
        }
        
        .btn-delete:hover {
          background: #fee2e2;
          border-color: #fecaca;
          color: #dc2626;
        }
      `}</style>
    </div>
  )
}

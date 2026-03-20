import type { PageResponse } from '../../types'

interface PaginationProps {
  page: PageResponse<any>
  onPageChange: (page: number) => void
}

export default function Pagination({ page, onPageChange }: PaginationProps) {
  const { current, pages, total, size } = page

  // 生成页码数组
  const getPageNumbers = () => {
    const pageNumbers: (number | string)[] = []
    const maxVisible = 5 // 最多显示5个页码

    if (pages <= maxVisible) {
      // 如果总页数小于等于最大显示数，显示所有页码
      for (let i = 1; i <= pages; i++) {
        pageNumbers.push(i)
      }
    } else {
      // 总是显示第一页
      pageNumbers.push(1)

      if (current > 3) {
        pageNumbers.push('...')
      }

      // 计算中间显示的页码
      let start = Math.max(2, current - 1)
      let end = Math.min(pages - 1, current + 1)

      if (current <= 3) {
        end = Math.min(pages - 1, 4)
      }
      if (current >= pages - 2) {
        start = Math.max(2, pages - 3)
      }

      for (let i = start; i <= end; i++) {
        pageNumbers.push(i)
      }

      if (current < pages - 2) {
        pageNumbers.push('...')
      }

      // 总是显示最后一页
      pageNumbers.push(pages)
    }

    return pageNumbers
  }

  if (pages <= 1) return null

  const startItem = (current - 1) * size + 1
  const endItem = Math.min(current * size, total)

  return (
    <div className="pagination-container">
      <div className="pagination-info">
        显示 {startItem}-{endItem} 条，共 {total} 条
      </div>
      <div className="pagination-controls">
        <button
          className="pagination-btn"
          disabled={current <= 1}
          onClick={() => onPageChange(current - 1)}
        >
          上一页
        </button>

        {getPageNumbers().map((pageNum, index) => (
          pageNum === '...' ? (
            <span key={`ellipsis-${index}`} className="pagination-ellipsis">...</span>
          ) : (
            <button
              key={pageNum}
              className={`pagination-btn ${pageNum === current ? 'active' : ''}`}
              onClick={() => pageNum !== current && onPageChange(pageNum as number)}
            >
              {pageNum}
            </button>
          )
        ))}

        <button
          className="pagination-btn"
          disabled={current >= pages}
          onClick={() => onPageChange(current + 1)}
        >
          下一页
        </button>
      </div>
    </div>
  )
}

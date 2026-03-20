'use client'

interface PaginationProps {
  currentPage: number
  totalPages: number
  total: number
  onPageChange: (page: number) => void
}

export default function Pagination({ currentPage, totalPages, total, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null

  // 生成页码数组
  const getPageNumbers = () => {
    const pageNumbers: (number | string)[] = []
    const maxVisible = 5

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i)
      }
    } else {
      pageNumbers.push(1)

      if (currentPage > 3) {
        pageNumbers.push('...')
      }

      let start = Math.max(2, currentPage - 1)
      let end = Math.min(totalPages - 1, currentPage + 1)

      if (currentPage <= 3) {
        end = Math.min(totalPages - 1, 4)
      }
      if (currentPage >= totalPages - 2) {
        start = Math.max(2, totalPages - 3)
      }

      for (let i = start; i <= end; i++) {
        pageNumbers.push(i)
      }

      if (currentPage < totalPages - 2) {
        pageNumbers.push('...')
      }

      pageNumbers.push(totalPages)
    }

    return pageNumbers
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t border-gray-200">
      <div className="text-sm text-gray-600">
        共 {total} 篇文章
      </div>
      <div className="flex items-center gap-2">
        <button
          className="px-3 py-2 text-sm font-medium rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          上一页
        </button>

        <div className="flex items-center gap-1">
          {getPageNumbers().map((pageNum, index) => (
            pageNum === '...' ? (
              <span key={`ellipsis-${index}`} className="px-2 text-gray-400">...</span>
            ) : (
              <button
                key={pageNum}
                className={`w-10 h-10 text-sm font-medium rounded-md transition-colors ${
                  pageNum === currentPage
                    ? 'bg-blue-600 text-white'
                    : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => pageNum !== currentPage && onPageChange(pageNum as number)}
              >
                {pageNum}
              </button>
            )
          ))}
        </div>

        <button
          className="px-3 py-2 text-sm font-medium rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          下一页
        </button>
      </div>
    </div>
  )
}

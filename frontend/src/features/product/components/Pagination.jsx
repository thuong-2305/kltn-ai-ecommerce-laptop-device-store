import { ChevronLeft, ChevronRight } from 'lucide-react'

/**
 * Pagination - Modern pagination controls component
 */
function Pagination({ current, total, onPageChange, isLoading }) {
  const pages = Array.from({ length: total }, (_, i) => i + 1)

  // Show max 7 pages: prev, 3 before, current, 3 after, next
  const getVisiblePages = () => {
    if (total <= 7) return pages

    if (current <= 4) {
      return [...pages.slice(0, 5), '...', total]
    }

    if (current >= total - 3) {
      return [1, '...', ...pages.slice(total - 5)]
    }

    return [1, '...', current - 1, current, current + 1, '...', total]
  }

  const visiblePages = getVisiblePages()

  return (
    <div className="inline-flex items-center justify-center gap-1.5">
      {/* Previous Button */}
      <button
        onClick={() => onPageChange(current - 1)}
        disabled={current === 1 || isLoading}
        className="inline-flex items-center justify-center h-10 w-10 rounded-lg border border-slate-200 bg-white text-slate-900 text-sm font-semibold transition-all duration-200 hover:bg-slate-50 hover:border-slate-300 hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
        aria-label="Trang trước"
        title="Trang trước"
      >
        <ChevronLeft size={18} />
      </button>

      {/* Page Numbers */}
      {visiblePages.map((page, index) => {
        if (page === '...') {
          return (
            <span key={`dots-${index}`} className="px-2 text-slate-400 text-sm font-medium">
              ...
            </span>
          )
        }

        return (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            disabled={isLoading}
            className={`inline-flex items-center justify-center h-10 w-10 rounded-lg text-sm font-semibold transition-all duration-200 ${
              page === current
                ? 'bg-blue-600 text-white border border-blue-600 shadow-md hover:shadow-lg'
                : 'border border-slate-200 bg-white text-slate-900 hover:bg-slate-50 hover:border-slate-300 hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed'
            }`}
            aria-label={`Trang ${page}`}
            aria-current={page === current ? 'page' : undefined}
          >
            {page}
          </button>
        )
      })}

      {/* Next Button */}
      <button
        onClick={() => onPageChange(current + 1)}
        disabled={current === total || isLoading}
        className="inline-flex items-center justify-center h-10 w-10 rounded-lg border border-slate-200 bg-white text-slate-900 text-sm font-semibold transition-all duration-200 hover:bg-slate-50 hover:border-slate-300 hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
        aria-label="Trang tiếp theo"
        title="Trang tiếp theo"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  )
}

export default Pagination


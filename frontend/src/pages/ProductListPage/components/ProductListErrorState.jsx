/**
 * ProductListErrorState - Error screen
 */
function ProductListErrorState({ error, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 px-6 rounded-2xl border border-red-200 bg-red-50">
      <svg className="w-16 h-16 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M12 9v2m0 4v2m0-12a9 9 0 110 18 9 9 0 010-18z"
        />
      </svg>

      <div className="text-center">
        <p className="text-body font-semibold text-red-900 mb-2">Có lỗi xảy ra</p>
        <p className="text-body-sm text-red-700 max-w-md">
          {error || 'Không thể tải sản phẩm. Vui lòng thử lại'}
        </p>
      </div>

      <button
        onClick={onRetry}
        className="px-6 h-11 rounded-lg bg-red-600 text-white text-button font-semibold transition-colors hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600/30 mt-2"
      >
        Thử lại
      </button>
    </div>
  )
}

export default ProductListErrorState

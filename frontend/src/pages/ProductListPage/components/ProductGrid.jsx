import ProductCard from './ProductCard'

/**
 * ProductGrid - Grid display of product cards
 */
function ProductGrid({ 
  products, 
  loading, 
  onAddToCart, 
  onAddToWishlist,
  onQuickView,
  onCompare 
}) {
  if (loading) {
    // Loading skeleton
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-slate-200 bg-white overflow-hidden h-96 animate-pulse"
          >
            <div className="w-full h-64 bg-slate-200" />
            <div className="p-4 space-y-3">
              <div className="h-3 bg-slate-200 rounded w-16" />
              <div className="h-4 bg-slate-200 rounded w-full" />
              <div className="h-3 bg-slate-200 rounded w-20" />
              <div className="h-10 bg-slate-200 rounded w-full mt-auto" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!products || products.length === 0) {
    // Empty state
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 px-6 rounded-xl border border-slate-200 bg-white">
        <svg className="w-16 h-16 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
        <div className="text-center">
          <p className="text-lg font-semibold text-slate-900 mb-1">Không tìm thấy sản phẩm</p>
          <p className="text-sm text-slate-600">
            Hãy thử thay đổi các bộ lọc hoặc tìm kiếm lại
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={onAddToCart}
          onAddToWishlist={onAddToWishlist}
          onQuickView={onQuickView}
          onCompare={onCompare}
        />
      ))}
    </div>
  )
}

export default ProductGrid


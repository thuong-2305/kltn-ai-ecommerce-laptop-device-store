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
    // Loading skeleton matching new ProductCard layout
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col rounded-xl border border-slate-200 bg-white overflow-hidden animate-pulse h-full"
          >
            <div className="w-full aspect-[4/3] bg-slate-200" />
            <div className="flex flex-col gap-3 p-5 flex-1 border-t border-slate-100">
              <div className="space-y-2">
                 <div className="h-3 bg-slate-200 rounded w-16" />
                 <div className="h-4 bg-slate-200 rounded w-full" />
                 <div className="h-4 bg-slate-200 rounded w-3/4" />
              </div>
              <div className="space-y-1.5 mt-2">
                 <div className="h-2.5 bg-slate-200 rounded w-full" />
                 <div className="h-2.5 bg-slate-200 rounded w-5/6" />
                 <div className="h-2.5 bg-slate-200 rounded w-4/6" />
              </div>
              <div className="mt-auto pt-4 space-y-3">
                 <div className="h-5 bg-slate-200 rounded w-1/2" />
                 <div className="h-10 bg-slate-200 rounded w-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!products || products.length === 0) {
    // Empty state
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 px-6 rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center">
          <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-slate-900 mb-1">Không tìm thấy sản phẩm</p>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            Rất tiếc, chúng tôi không tìm thấy sản phẩm nào phù hợp với bộ lọc của bạn. Hãy thử thay đổi tiêu chí tìm kiếm.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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


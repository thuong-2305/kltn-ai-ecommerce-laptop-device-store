import { useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { ChevronRight, SearchX } from 'lucide-react'
import { useProductFilters } from '../../features/product/hooks/useProductFilters'
import ProductGrid from '../../features/product/components/ProductGrid'
import Pagination from '../../features/product/components/Pagination'
import ProductListLoadingState from '../../features/product/components/ProductListLoadingState'
import ProductListErrorState from '../../features/product/components/ProductListErrorState'

function SearchPage() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  const ids = searchParams.get('ids') || ''
  const isImageSearch = searchParams.get('img_search') === 'true'
  const imagePreview = isImageSearch ? sessionStorage.getItem('image_search_preview') : null

  // Sử dụng lại hook filter từ ProductListPage để fetch data chuẩn xác
  const {
    products,
    pagination,
    loading,
    error,
    updateFilters,
    goToPage,
    refetch,
  } = useProductFilters()

  // Đồng bộ URL parameter với hook
  useEffect(() => {
    if (ids) {
      updateFilters({ ids: ids, search: '', category: null, sortBy: 'newest' })
    } else {
      updateFilters({ ids: null, search: query, category: null, sortBy: 'newest' })
    }
  }, [query, ids, updateFilters])

  return (
    <div className="mx-4.5 py-6 pb-16 min-h-[60vh]">
      {/* Breadcrumb */}
      <nav className="mb-5 flex items-center gap-1.5 text-sm flex-wrap">
        <Link to="/" className="text-slate-500 hover:text-blue-600 font-medium">Trang chủ</Link>
        <ChevronRight size={13} className="text-slate-300" />
        <span className="text-blue-600 font-semibold">Tìm kiếm</span>
      </nav>

      {/* Header */}
      <div className="mb-8 border-b border-slate-200/80 pb-4">
        {isImageSearch ? (
          <div className="flex flex-col md:flex-row gap-5 items-start md:items-center">
            {imagePreview && (
              <div className="relative group shrink-0">
                <div className="absolute -inset-1.5 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl blur-md opacity-25 group-hover:opacity-40 transition duration-300" />
                <img 
                  src={imagePreview} 
                  alt="Ảnh tìm kiếm" 
                  className="relative w-24 h-24 object-cover rounded-xl border border-slate-200 shadow-sm"
                />
              </div>
            )}
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-slate-900 mb-1 tracking-tight">
                Kết quả tìm kiếm bằng hình ảnh
              </h1>
              <p className="text-slate-500 text-sm mt-1">
                {!loading ? `Tìm thấy ${pagination.total} sản phẩm tương tự với hình ảnh của bạn.` : 'Đang phân tích hình ảnh...'}
              </p>
            </div>
          </div>
        ) : (
          <>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 mb-1 tracking-tight">
              Kết quả tìm kiếm cho: <span className="text-blue-600">"{query}"</span>
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              {!loading ? `Tìm thấy ${pagination.total} sản phẩm phù hợp.` : 'Đang tìm kiếm...'}
            </p>
          </>
        )}
      </div>

      {/* Content */}
      <div className="space-y-6">
        {loading && <ProductListLoadingState />}
        
        {error && <ProductListErrorState error={error} onRetry={refetch} />}
        
        {!loading && !error && products.length === 0 && (
          <div className="py-20 text-center bg-slate-50 rounded-2xl border border-slate-100">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-white shadow-sm mb-4">
              <SearchX size={28} className="text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Không tìm thấy sản phẩm</h3>
            <p className="text-slate-600 mb-6 max-w-sm mx-auto">
              Rất tiếc, chúng tôi không tìm thấy kết quả nào cho từ khóa <strong>"{query}"</strong>. 
              Hãy thử kiểm tra lại lỗi chính tả hoặc dùng từ khóa chung chung hơn.
            </p>
            <Link to="/products" className="inline-flex items-center gap-2 px-6 h-11 rounded-xl bg-blue-600 text-white font-bold text-sm shadow-md hover:bg-blue-700 hover:-translate-y-0.5 transition-all">
              Xem tất cả sản phẩm
            </Link>
          </div>
        )}

        {!loading && !error && products.length > 0 && (
          <>
            <ProductGrid
              products={products}
              loading={loading}
              onAddToCart={() => {}}
              onAddToWishlist={() => {}}
            />
            
            {pagination.totalPages > 1 && (
              <div className="flex justify-center pt-8 pb-4">
                <Pagination
                  current={pagination.page}
                  total={pagination.totalPages}
                  onPageChange={goToPage}
                  isLoading={loading}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default SearchPage

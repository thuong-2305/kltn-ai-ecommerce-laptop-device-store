import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useProductFilters } from '../../features/product/hooks/useProductFilters'
import FilterSidebar from '../../features/product/components/FilterSidebar'
import ProductGrid from '../../features/product/components/ProductGrid'
import SortOptions from '../../features/product/components/SortOptions'
import Pagination from '../../features/product/components/Pagination'
import ProductListLoadingState from '../../features/product/components/ProductListLoadingState'
import ProductListErrorState from '../../features/product/components/ProductListErrorState'
import { Filter } from 'lucide-react'
import { addToCart } from '../../services/cartApi'
import { useWishlistStore } from '../../hooks/useWishlistStore'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'

/**
 * ProductListPage - Modern product listing page
 * Features: Filtering, sorting, pagination, responsive layout
 */
function ProductListPage() {
  const [searchParams, setSearchParams] = useSearchParams()

  // Get filters from custom hook
  const {
    products,
    filters,
    pagination,
    loading,
    error,
    updateFilter,
    updateFilters,
    goToPage,
    resetFilters,
    refetch,
  } = useProductFilters()

  // Mobile filter sidebar state
  const [filterSidebarOpen, setFilterSidebarOpen] = useState(false)
  const toggleWishlist = useWishlistStore(state => state.toggleWishlist)

  // Mock categories
  const [categories, setCategories] = useState([
    { id: 1, name: 'Gaming Laptop' },
    { id: 2, name: 'Laptop Văn Phòng' },
    { id: 3, name: 'Laptop Thiết Kế' },
    { id: 4, name: 'Laptop Ultrabook' },
    { id: 5, name: 'Laptop 2-in-1' },
  ])

  const activeCategoryName = filters.category 
    ? categories.find(c => String(c.id) === String(filters.category))?.name || 'Sản phẩm'
    : 'Tất cả sản phẩm'

  useDocumentTitle(
    activeCategoryName,
    `Khám phá danh sách ${activeCategoryName} chất lượng cao, cấu hình mạnh mẽ, chính hãng, giá cạnh tranh nhất thị trường tại LAPTOP DEVICE STORE.`
  )

  // Sync URL params with filters
  useEffect(() => {
    const search = searchParams.get('q')
    const category = searchParams.get('category')
    const minPrice = searchParams.get('min_price')
    const maxPrice = searchParams.get('max_price')
    const sort = searchParams.get('sort')

    const newFilters = {}
    if (search !== null) newFilters.search = search
    if (category !== null) newFilters.category = category
    if (minPrice !== null) newFilters.minPrice = minPrice
    if (maxPrice !== null) newFilters.maxPrice = maxPrice
    if (sort !== null) newFilters.sort = sort

    updateFilters(newFilters)
  }, [searchParams])

  // Update URL params when filters change
  const handleFilterChange = (filterKey, value) => {
    updateFilter(filterKey, value)

    const newParams = new URLSearchParams(searchParams)
    if (value) {
      newParams.set(filterKey === 'search' ? 'q' : filterKey, value)
    } else {
      newParams.delete(filterKey === 'search' ? 'q' : filterKey)
    }
    setSearchParams(newParams)
  }

  const handleSortChange = (sortBy) => {
    updateFilter('sortBy', sortBy)

    const newParams = new URLSearchParams(searchParams)
    newParams.set('sort', sortBy)
    setSearchParams(newParams)
  }

  const handleReset = () => {
    resetFilters()
    setSearchParams({})
  }

  const handleAddToCart = async (product) => {
    try {
      await addToCart(product.id, 1)
      alert(`Đã thêm "${product.name}" vào giỏ hàng!`)
    } catch {
      alert('Không thể thêm sản phẩm vào giỏ hàng.')
    }
  }

  const handleAddToWishlist = async (product) => {
    try {
      const res = await toggleWishlist(product)
      alert(res.message)
    } catch {
      alert('Thao tác danh sách yêu thích thất bại.')
    }
  }

  const handleQuickView = (product) => {
    // TODO: Implement quick view modal
  }

  const handleCompare = (product) => {
    // TODO: Implement compare functionality
  }

  return (
    <div className="mx-4.5 py-6 pb-16">
      {/* Breadcrumb */}
      <nav className="mb-5 flex items-center gap-2 text-sm">
        <a href="/" className="text-slate-500 hover:text-blue-600 transition-colors font-medium">Trang chủ</a>
        <span className="text-slate-300">/</span>
        <a href="#" className="text-slate-500 hover:text-blue-600 transition-colors font-medium">Sản phẩm</a>
        <span className="text-slate-300">/</span>
        <span className="text-slate-900 font-semibold">{filters.category ? categories.find(c => c.id === filters.category)?.name || 'Danh mục' : 'Tất cả'}</span>
      </nav>

      {/* Page Header */}
      <div className="mb-5 flex flex-col md:flex-row md:items-end md:justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 mb-1 uppercase tracking-tight">
            {filters.category ? categories.find(c => c.id === filters.category)?.name || 'Sản phẩm' : 'Tất cả sản phẩm'}
          </h1>
          <p className="text-slate-500 text-sm">
            Hiển thị {!loading ? `${products.length} trong ${pagination.total}` : '...'} kết quả
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => setFilterSidebarOpen(true)}
            className="md:hidden flex-1 inline-flex items-center justify-center gap-2 px-4 h-10 rounded-xl border border-slate-200 bg-white/80 text-slate-700 font-semibold text-sm transition-all hover:bg-slate-50 active:scale-95 shadow-sm"
          >
            <Filter size={16} />
            Lọc sản phẩm
          </button>
          <div className="flex-1 md:flex-none">
            <SortOptions value={filters.sortBy} onChange={handleSortChange} />
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[240px_1fr]">
        {/* Sticky Sidebar */}
        <div className="hidden lg:block relative">
          <div className="sticky top-24">
            <FilterSidebar
              categories={categories}
              filters={filters}
              onFilterChange={handleFilterChange}
              onReset={handleReset}
            />
          </div>
        </div>

        {/* Product Area */}
        <div className="space-y-6">
          {loading && <ProductListLoadingState />}
          {error && <ProductListErrorState error={error} onRetry={refetch} />}
          {!loading && !error && products.length === 0 && <EmptyState />}
          {!loading && !error && products.length > 0 && (
            <>
              <ProductGrid
                products={products}
                loading={loading}
                onAddToCart={handleAddToCart}
                onAddToWishlist={handleAddToWishlist}
                onQuickView={handleQuickView}
                onCompare={handleCompare}
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

      {/* Mobile Filter Drawer */}
      <MobileFilterDrawer
        isOpen={filterSidebarOpen}
        onClose={() => setFilterSidebarOpen(false)}
        categories={categories}
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleReset}
      />
    </div>
  )
}

/**
 * MobileFilterDrawer - Mobile filter drawer component
 */
function MobileFilterDrawer({ isOpen, onClose, categories, filters, onFilterChange, onReset }) {
  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed left-0 top-0 z-40 h-screen w-72 bg-white shadow-xl transition-transform duration-300 md:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <FilterSidebar
          categories={categories}
          filters={filters}
          onFilterChange={onFilterChange}
          onReset={onReset}
          isOpen={isOpen}
          onClose={onClose}
        />
      </div>
    </>
  )
}

/**
 * EmptyState - Empty products state component
 */
function EmptyState() {
  return (
    <div className="py-16 text-center">
      <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-slate-100 mb-4">
        <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4m0 0l-8 4m8-4v10l-8-4m8 4l8-4m-8 4l-8-4m0 0v10l8 4m-8-4l8 4" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-slate-900 mb-2">Không tìm thấy sản phẩm</h3>
      <p className="text-slate-600 mb-6">Thử thay đổi bộ lọc hoặc tìm kiếm khác</p>
      <button className="inline-flex items-center gap-2 px-6 h-10 rounded-lg bg-blue-600 text-white font-semibold transition-all hover:bg-blue-700">
        Xem tất cả sản phẩm
      </button>
    </div>
  )
}

export default ProductListPage

import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useProductFilters } from './hooks/useProductFilters'
import FilterSidebar from './components/FilterSidebar'
import ProductGrid from './components/ProductGrid'
import SortOptions from './components/SortOptions'
import Pagination from './components/Pagination'
import ProductListLoadingState from './components/ProductListLoadingState'
import ProductListErrorState from './components/ProductListErrorState'
import { Filter } from 'lucide-react'

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

  // Mock categories
  const [categories, setCategories] = useState([
    { id: 1, name: 'Gaming Laptop' },
    { id: 2, name: 'Laptop Văn Phòng' },
    { id: 3, name: 'Laptop Thiết Kế' },
    { id: 4, name: 'Laptop Ultrabook' },
    { id: 5, name: 'Laptop 2-in-1' },
  ])

  // Sync URL params with filters
  useEffect(() => {
    const search = searchParams.get('q')
    const category = searchParams.get('category')
    const sort = searchParams.get('sort')

    if (search || category || sort) {
      updateFilters({
        search: search || '',
        category: category ? parseInt(category) : null,
        sortBy: sort || 'newest',
      })
    }
  }, [searchParams, updateFilters])

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

  const handleAddToCart = (product) => {
    console.log('Added to cart:', product)
    alert(`Đã thêm "${product.name}" vào giỏ hàng`)
  }

  const handleAddToWishlist = (product) => {
    console.log('Added to wishlist:', product)
    alert(`Đã thêm "${product.name}" vào danh sách yêu thích`)
  }

  const handleQuickView = (product) => {
    console.log('Quick view:', product)
    // TODO: Implement quick view modal
  }

  const handleCompare = (product) => {
    console.log('Compare:', product)
    // TODO: Implement compare functionality
  }

  return (
    <div className="w-full bg-slate-50 min-h-screen">
      {/* Page Container */}
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8 py-8 md:py-12">
        {/* Breadcrumb Navigation */}
        <nav className="mb-8 flex items-center gap-2 text-sm">
          <a href="/" className="text-slate-600 hover:text-blue-600 transition-colors font-medium">
            Trang chủ
          </a>
          <span className="text-slate-300">/</span>
          <a href="#" className="text-slate-600 hover:text-blue-600 transition-colors font-medium">
            Sản phẩm
          </a>
          <span className="text-slate-300">/</span>
          <span className="text-slate-900 font-semibold">Laptop</span>
        </nav>

        {/* Page Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-2">
              Laptop
            </h1>
            <p className="text-slate-600 text-base">
              Hiển thị {products.length} / {pagination.total} sản phẩm
            </p>
          </div>

          {/* Mobile Filter Toggle Button */}
          <button
            onClick={() => setFilterSidebarOpen(true)}
            className="md:hidden inline-flex items-center gap-2 px-4 h-11 rounded-lg bg-blue-600 text-white font-semibold text-sm transition-all hover:bg-blue-700 active:scale-95"
          >
            <Filter size={18} />
            Bộ lọc
          </button>
        </div>

        {/* Main Content - Grid Layout */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-[280px_1fr]">
          {/* Sidebar - Desktop Only */}
          <div className="hidden md:block">
            <div className="sticky top-20">
              <FilterSidebar
                categories={categories}
                filters={filters}
                onFilterChange={handleFilterChange}
                onReset={handleReset}
              />
            </div>
          </div>

          {/* Main Content Area */}
          <div className="space-y-6">
            {/* Toolbar - Sort & View Options */}
            <div className="flex items-center justify-between gap-4 p-4 bg-white rounded-lg border border-slate-200">
              <div className="text-sm text-slate-600 font-medium hidden sm:block">
                {!loading && products.length > 0
                  ? `Hiển thị ${products.length} sản phẩm`
                  : ''}
              </div>
              <div className="flex-1 sm:flex-none">
                <SortOptions value={filters.sortBy} onChange={handleSortChange} />
              </div>
            </div>

            {/* Product Grid or Loading/Error State */}
            {loading && <ProductListLoadingState />}
            {error && <ProductListErrorState error={error} onRetry={refetch} />}

            {!loading && !error && products.length === 0 && (
              <EmptyState />
            )}

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

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex justify-center pt-8">
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
      </div>

      {/* Mobile Filter Sidebar Drawer */}
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

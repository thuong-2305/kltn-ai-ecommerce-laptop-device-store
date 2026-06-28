import { useState, useEffect, useMemo, useCallback } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { useProductFilters } from '../../features/product/hooks/useProductFilters'
import FilterSidebar from '../../features/product/components/FilterSidebar'
import ProductGrid from '../../features/product/components/ProductGrid'
import SortOptions from '../../features/product/components/SortOptions'
import Pagination from '../../features/product/components/Pagination'
import ProductListLoadingState from '../../features/product/components/ProductListLoadingState'
import ProductListErrorState from '../../features/product/components/ProductListErrorState'
import { Filter, X } from 'lucide-react'
import { useCart } from '../../features/cart/hooks/useCart'
import { useWishlistStore } from '../../hooks/useWishlistStore'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import api from '../../services/api'
import { formatPrice } from '../../shared/utils/formatters'
import { toast } from '../../shared/utils/toast'


// Module-level cache for metadata to prevent redundant API fetches on remount
let cachedCategories = null
let cachedBrands = null

/**
 * ProductListPage - Optimized product listing page
 */
function ProductListPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [categories, setCategories] = useState(cachedCategories || [])
  const [brands, setBrands] = useState(cachedBrands || [])
  const [filterSidebarOpen, setFilterSidebarOpen] = useState(false)
  const toggleWishlist = useWishlistStore(state => state.toggleWishlist)
  const { addItem } = useCart()

  // Fetch metadata once per application lifetime (or use cache)
  useEffect(() => {
    if (cachedCategories && cachedBrands) return

    const fetchMetadata = async () => {
      try {
        const [categoriesRes, brandsRes] = await Promise.all([
          api.get('/categories/'),
          api.get('/brands/')
        ])
        cachedCategories = categoriesRes.data.results || []
        cachedBrands = brandsRes.data.results || []
        setCategories(cachedCategories)
        setBrands(cachedBrands)
      } catch (err) {
        console.error('Error fetching categories or brands:', err)
      }
    }
    fetchMetadata()
  }, [])

  const {
    products,
    filters,
    pagination,
    loading,
    error,
    updateFilters,
    goToPage,
    resetFilters,
    refetch,
  } = useProductFilters()

  // Parse URL search parameters into a memoized object
  const parsedFiltersFromUrl = useMemo(() => {
    return {
      search: searchParams.get('q') || '',
      category: searchParams.get('category') ? (isNaN(searchParams.get('category')) ? searchParams.get('category') : parseInt(searchParams.get('category'))) : null,
      brand: searchParams.get('brand') ? (isNaN(searchParams.get('brand')) ? searchParams.get('brand') : parseInt(searchParams.get('brand'))) : null,
      cpu: searchParams.get('cpu') || null,
      ram: searchParams.get('ram') || null,
      storage: searchParams.get('storage') || null,
      screen: searchParams.get('screen') || null,
      os: searchParams.get('os') || null,
      minPrice: parseInt(searchParams.get('min_price')) || 0,
      maxPrice: parseInt(searchParams.get('max_price')) || 100000000,
      sortBy: searchParams.get('sort') || 'newest',
      page: parseInt(searchParams.get('page')) || 1,
    }
  }, [searchParams])

  // Sync state from URL to the filters hook
  useEffect(() => {
    updateFilters(parsedFiltersFromUrl)
  }, [parsedFiltersFromUrl, updateFilters])

  // Local state for sidebar filters to prevent instant API fetches
  const [localFilters, setLocalFilters] = useState(filters)

  // Keep localFilters in sync with filters hook when filters change from outside (URL sync)
  useEffect(() => {
    setLocalFilters(filters)
  }, [filters])

  const handleLocalFilterChange = useCallback((filterKey, value) => {
    setLocalFilters((prev) => ({
      ...prev,
      [filterKey]: value,
    }))
  }, [])

  const handleApplyFilters = useCallback(() => {
    const newParams = new URLSearchParams(searchParams)
    
    // Reset page back to 1 on filter edits
    newParams.delete('page')

    const filterKeys = ['category', 'brand', 'cpu', 'ram', 'storage', 'screen', 'os', 'minPrice', 'maxPrice']
    filterKeys.forEach((key) => {
      let urlKey = key
      if (key === 'minPrice') urlKey = 'min_price'
      if (key === 'maxPrice') urlKey = 'max_price'

      const value = localFilters[key]
      if (value !== null && value !== undefined && value !== '' && value !== 0 && value !== 100000000) {
        newParams.set(urlKey, value)
      } else {
        newParams.delete(urlKey)
      }
    })

    setSearchParams(newParams)
  }, [localFilters, searchParams, setSearchParams])

  const activeCategoryName = useMemo(() => {
    if (!filters.category) return 'Tất cả sản phẩm'
    return categories.find(c => String(c.id) === String(filters.category))?.name || 'Sản phẩm'
  }, [filters.category, categories])

  useDocumentTitle(
    activeCategoryName,
    `Khám phá danh sách ${activeCategoryName} chất lượng cao, cấu hình mạnh mẽ, chính hãng, giá cạnh tranh tại LAPTOP DEVICE STORE.`
  )

  // Navigate by updating URL params (hook will automatically sync on state update)
  const handleFilterChange = useCallback((filterKey, value) => {
    const newParams = new URLSearchParams(searchParams)
    let urlKey = filterKey
    if (filterKey === 'search') urlKey = 'q'
    if (filterKey === 'minPrice') urlKey = 'min_price'
    if (filterKey === 'maxPrice') urlKey = 'max_price'

    // Reset page back to 1 on filter edits
    newParams.delete('page')

    if (value !== null && value !== undefined && value !== '') {
      newParams.set(urlKey, value)
    } else {
      newParams.delete(urlKey)
    }
    setSearchParams(newParams)
  }, [searchParams, setSearchParams])

  const handleSortChange = useCallback((sortBy) => {
    const newParams = new URLSearchParams(searchParams)
    newParams.set('sort', sortBy)
    newParams.delete('page')
    setSearchParams(newParams)
  }, [searchParams, setSearchParams])

  const handleReset = useCallback(() => {
    resetFilters()
    setSearchParams({})
  }, [resetFilters, setSearchParams])

  const handleClearFilter = useCallback((key) => {
    if (key === 'price') {
      const newParams = new URLSearchParams(searchParams)
      newParams.delete('min_price')
      newParams.delete('max_price')
      newParams.delete('page')
      setSearchParams(newParams)
    } else {
      handleFilterChange(key, null)
    }
  }, [searchParams, handleFilterChange, setSearchParams])

  const handleAddToCart = useCallback(async (product) => {
    const res = await addItem(product.id, 1)
    if (res.success) {
      toast.success(res.message || `Đã thêm "${product.name}" vào giỏ hàng!`)
    } else {
      toast.error(res.message || 'Không thể thêm sản phẩm vào giỏ hàng.')
    }
  }, [addItem])

  const handleAddToWishlist = useCallback(async (product) => {
    try {
      const res = await toggleWishlist(product)
      toast.success(res.message)
    } catch {
      toast.error('Thao tác danh sách yêu thích thất bại.')
    }
  }, [toggleWishlist])

  const handleQuickView = useCallback((product) => {
    // TODO: Implement quick view modal
  }, [])

  const handleCompare = useCallback((product) => {
    // TODO: Implement compare functionality
  }, [])

  // Memoize active filters list to prevent structural re-evaluation on renders
  const activeFiltersList = useMemo(() => {
    const list = []
    if (filters.category) {
      const cat = categories.find(c => String(c.id) === String(filters.category))
      if (cat) list.push({ key: 'category', label: `Danh mục: ${cat.name}` })
    }
    if (filters.brand) {
      const brnd = brands.find(b => String(b.id) === String(filters.brand))
      if (brnd) list.push({ key: 'brand', label: `Thương hiệu: ${brnd.name}` })
    }
    if (filters.search) {
      list.push({ key: 'search', label: `Tìm kiếm: "${filters.search}"` })
    }
    if (filters.minPrice > 0 || (filters.maxPrice < 100000000 && filters.maxPrice > 0)) {
      list.push({ 
        key: 'price', 
        label: `Giá: ${formatPrice(filters.minPrice)} - ${formatPrice(filters.maxPrice)}` 
      })
    }
    if (filters.cpu) list.push({ key: 'cpu', label: `CPU: ${filters.cpu}` })
    if (filters.ram) list.push({ key: 'ram', label: `RAM: ${filters.ram}` })
    if (filters.storage) list.push({ key: 'storage', label: `Ổ cứng: ${filters.storage}` })
    if (filters.screen) list.push({ key: 'screen', label: `Màn hình: ${filters.screen}` })
    if (filters.os) list.push({ key: 'os', label: `HĐH: ${filters.os}` })
    return list
  }, [filters, categories, brands])

  const handlePageChange = useCallback((page) => {
    const newParams = new URLSearchParams(searchParams)
    newParams.set('page', page)
    setSearchParams(newParams)
    goToPage(page)
  }, [searchParams, goToPage, setSearchParams])

  return (
    <div className="mx-4.5 py-6 pb-16">
      {/* Breadcrumb */}
      <nav className="mb-5 flex items-center gap-2 text-sm">
        <Link to="/" className="text-slate-500 hover:text-blue-600 transition-colors font-medium">Trang chủ</Link>
        <span className="text-slate-300">/</span>
        <span className="text-slate-500 font-medium">Sản phẩm</span>
        <span className="text-slate-300">/</span>
        <span className="text-slate-900 font-semibold">{activeCategoryName}</span>
      </nav>

      {/* Page Header */}
      <div className="mb-5 flex flex-col md:flex-row md:items-end md:justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 mb-1 uppercase tracking-tight">
            {activeCategoryName}
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

      {/* Active Filters Chip Bar */}
      {activeFiltersList.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-6 bg-slate-50/50 p-3 rounded-xl border border-slate-100/80 animate-in fade-in duration-200">
          <span className="text-xs font-bold text-slate-500 mr-1.5 uppercase tracking-wider">Đang lọc:</span>
          <div className="flex flex-wrap items-center gap-2 flex-1">
            {activeFiltersList.map((item) => (
              <span
                key={item.key}
                className="inline-flex items-center gap-1.5 pl-3 pr-2 py-1 rounded-full bg-white border border-slate-200 text-xs font-medium text-slate-700 shadow-sm"
              >
                {item.label}
                <button
                  onClick={() => handleClearFilter(item.key)}
                  className="text-slate-400 hover:text-slate-650 hover:bg-slate-100 rounded-full p-0.5 transition-colors focus:outline-none"
                  aria-label={`Xóa bộ lọc ${item.label}`}
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
          <button
            onClick={handleReset}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors ml-auto pl-2 py-1"
          >
            Xóa tất cả bộ lọc
          </button>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[240px_1fr]">
        {/* Sticky Sidebar */}
        <div className="hidden lg:block relative">
          <div className="sticky top-24">
            <FilterSidebar
              categories={categories}
              brands={brands}
              filters={localFilters}
              onFilterChange={handleLocalFilterChange}
              onApplyFilters={handleApplyFilters}
              onReset={handleReset}
            />
          </div>
        </div>

        {/* Product Area */}
        <div className="space-y-6">
          {loading && <ProductListLoadingState />}
          {error && <ProductListErrorState error={error} onRetry={refetch} />}
          {!loading && !error && products.length === 0 && <EmptyState onReset={handleReset} />}
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
                    onPageChange={handlePageChange}
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
        brands={brands}
        filters={localFilters}
        onFilterChange={handleLocalFilterChange}
        onApplyFilters={handleApplyFilters}
        onReset={handleReset}
      />
    </div>
  )
}

function MobileFilterDrawer({ isOpen, onClose, categories, brands, filters, onFilterChange, onReset, onApplyFilters }) {
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <div
        className={`fixed left-0 top-0 z-50 h-screen w-72 bg-white shadow-xl transition-transform duration-300 md:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <FilterSidebar
          categories={categories}
          brands={brands}
          filters={filters}
          onFilterChange={onFilterChange}
          onReset={onReset}
          onApplyFilters={onApplyFilters}
          isOpen={isOpen}
          onClose={onClose}
        />
      </div>
    </>
  )
}

function EmptyState({ onReset }) {
  return (
    <div className="py-16 text-center">
      <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-slate-100 mb-4">
        <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4m0 0l-8 4m8-4v10l-8-4m8 4l8-4m-8 4l-8-4m0 0v10l8 4m-8-4l8 4" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-slate-900 mb-2">Không tìm thấy sản phẩm</h3>
      <p className="text-slate-650 mb-6">Thử thay đổi bộ lọc hoặc tìm kiếm khác</p>
      <button 
        onClick={onReset}
        className="inline-flex items-center gap-2 px-6 h-10 rounded-lg bg-blue-600 text-white font-semibold transition-all hover:bg-blue-750 active:scale-95"
      >
        Xem tất cả sản phẩm
      </button>
    </div>
  )
}

export default ProductListPage

import { useState } from 'react'
import { ChevronDown, X } from 'lucide-react'

/**
 * FilterSidebar - Modern left sidebar with product filters
 * Features: Category, Price range, Brand, Screen size, CPU, RAM, Reset filters
 */
function FilterSidebar({ categories = [], filters, onFilterChange, onReset, isOpen, onClose }) {
  const [expandedGroups, setExpandedGroups] = useState({
    category: true,
    price: true,
    brand: true,
    screen: false,
    cpu: false,
    ram: false,
  })

  const toggleGroup = (group) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [group]: !prev[group],
    }))
  }

  const handleCategoryChange = (categoryId) => {
    onFilterChange('category', filters.category === categoryId ? null : categoryId)
  }

  const handleMinPriceChange = (e) => {
    onFilterChange('minPrice', parseInt(e.target.value) || 0)
  }

  const handleMaxPriceChange = (e) => {
    onFilterChange('maxPrice', parseInt(e.target.value) || 100000000)
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
    }).format(price)
  }

  // Mock data for additional filters
  const brands = [
    { id: 1, name: 'Apple' },
    { id: 2, name: 'Dell' },
    { id: 3, name: 'HP' },
    { id: 4, name: 'Lenovo' },
    { id: 5, name: 'ASUS' },
  ]

  const screenSizes = ['13"', '14"', '15.6"', '17"']
  const cpus = ['Intel Core i5', 'Intel Core i7', 'Intel Core i9', 'AMD Ryzen 5', 'AMD Ryzen 7']
  const rams = ['8GB', '16GB', '32GB', '64GB']

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-40 h-screen w-72 overflow-y-auto bg-white shadow-xl transition-transform duration-300 md:static md:z-0 md:h-auto md:w-full md:shadow-none md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Mobile Header */}
        <div className="sticky top-0 flex items-center justify-between px-5 py-4 bg-white border-b border-slate-200 md:hidden">
          <h2 className="text-lg font-bold text-slate-900">Bộ lọc</h2>
          <button
            onClick={onClose}
            className="inline-flex items-center justify-center w-8 h-8 transition-colors rounded-lg text-slate-600 hover:bg-slate-100"
            aria-label="Đóng bộ lọc"
          >
            <X size={20} />
          </button>
        </div>

        {/* Sidebar Content */}
        <div className="p-5 space-y-6">
          {/* Reset button */}
          <button
            onClick={onReset}
            className="w-full h-10 px-4 text-sm font-semibold transition-all duration-200 border rounded-lg border-slate-200 bg-slate-50 text-slate-900 hover:bg-slate-100 hover:border-slate-300 hover:shadow-sm active:scale-95"
          >
            Đặt lại bộ lọc
          </button>

          {/* Category Filter */}
          {categories.length > 0 && (
            <div className="space-y-3">
              <FilterSection
                title="Danh mục"
                expanded={expandedGroups.category}
                onToggle={() => toggleGroup('category')}
              >
                <div className="space-y-2.5">
                  {categories.map((category) => (
                    <label
                      key={category.id}
                      className="flex items-center gap-3 cursor-pointer group"
                    >
                      <input
                        type="checkbox"
                        checked={filters.category === category.id}
                        onChange={() => handleCategoryChange(category.id)}
                        className="w-4 h-4 text-blue-600 rounded cursor-pointer border-slate-300 accent-blue-600"
                      />
                      <span className="text-sm font-medium transition-colors text-slate-600 group-hover:text-slate-900">
                        {category.name}
                      </span>
                    </label>
                  ))}
                </div>
              </FilterSection>
            </div>
          )}

          {/* Price Filter */}
          <FilterSection
            title="Giá"
            expanded={expandedGroups.price}
            onToggle={() => toggleGroup('price')}
          >
            <div className="space-y-3">
              {/* Min Price */}
              <div>
                <label htmlFor="min-price" className="text-xs font-semibold tracking-wide uppercase text-slate-600">
                  Giá tối thiểu
                </label>
                <input
                  id="min-price"
                  type="number"
                  value={filters.minPrice}
                  onChange={handleMinPriceChange}
                  placeholder="0"
                  className="w-full h-10 px-3 mt-2 text-sm transition-colors border rounded-lg border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              {/* Max Price */}
              <div>
                <label htmlFor="max-price" className="text-xs font-semibold tracking-wide uppercase text-slate-600">
                  Giá tối đa
                </label>
                <input
                  id="max-price"
                  type="number"
                  value={filters.maxPrice}
                  onChange={handleMaxPriceChange}
                  placeholder="100,000,000"
                  className="w-full h-10 px-3 mt-2 text-sm transition-colors border rounded-lg border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              {/* Price Range Display */}
              <div className="p-3 border border-blue-200 rounded-lg bg-blue-50">
                <p className="text-xs font-semibold text-blue-900">
                  {formatPrice(filters.minPrice)} - {formatPrice(filters.maxPrice)}
                </p>
              </div>
            </div>
          </FilterSection>

          {/* Brand Filter */}
          <FilterSection
            title="Hãng sản xuất"
            expanded={expandedGroups.brand}
            onToggle={() => toggleGroup('brand')}
          >
            <div className="space-y-2.5">
              {brands.map((brand) => (
                <label key={brand.id} className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-blue-600 rounded cursor-pointer border-slate-300 accent-blue-600"
                  />
                  <span className="text-sm font-medium transition-colors text-slate-600 group-hover:text-slate-900">
                    {brand.name}
                  </span>
                </label>
              ))}
            </div>
          </FilterSection>

          {/* Screen Size Filter */}
          <FilterSection
            title="Kích thước màn hình"
            expanded={expandedGroups.screen}
            onToggle={() => toggleGroup('screen')}
          >
            <div className="grid grid-cols-2 gap-2">
              {screenSizes.map((size) => (
                <label key={size} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-blue-600 rounded cursor-pointer border-slate-300 accent-blue-600"
                  />
                  <span className="text-sm font-medium text-slate-600">{size}</span>
                </label>
              ))}
            </div>
          </FilterSection>

          {/* CPU Filter */}
          <FilterSection
            title="CPU"
            expanded={expandedGroups.cpu}
            onToggle={() => toggleGroup('cpu')}
          >
            <div className="space-y-2.5">
              {cpus.map((cpu) => (
                <label key={cpu} className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-blue-600 rounded cursor-pointer border-slate-300 accent-blue-600"
                  />
                  <span className="text-sm font-medium transition-colors text-slate-600 group-hover:text-slate-900">
                    {cpu}
                  </span>
                </label>
              ))}
            </div>
          </FilterSection>

          {/* RAM Filter */}
          <FilterSection
            title="RAM"
            expanded={expandedGroups.ram}
            onToggle={() => toggleGroup('ram')}
          >
            <div className="grid grid-cols-2 gap-2">
              {rams.map((ram) => (
                <label key={ram} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-blue-600 rounded cursor-pointer border-slate-300 accent-blue-600"
                  />
                  <span className="text-sm font-medium text-slate-600">{ram}</span>
                </label>
              ))}
            </div>
          </FilterSection>
        </div>
      </aside>
    </>
  )
}

/**
 * FilterSection - Reusable filter section component
 */
function FilterSection({ title, expanded, onToggle, children }) {
  return (
    <div className="pb-5 border-b border-slate-100 last:border-b-0 last:pb-0">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full py-2 transition-colors text-slate-900 hover:text-blue-600"
      >
        <span className="text-sm font-bold tracking-wide uppercase text-slate-900">{title}</span>
        <ChevronDown
          size={18}
          className={`transition-transform duration-300 text-slate-600 ${expanded ? 'rotate-180' : ''}`}
        />
      </button>

      {expanded && <div className="mt-3">{children}</div>}
    </div>
  )
}

export default FilterSidebar

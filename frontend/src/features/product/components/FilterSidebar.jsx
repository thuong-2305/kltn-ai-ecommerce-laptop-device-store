import { useState } from 'react'
import { ChevronDown, X, ChevronRight, Search } from 'lucide-react'
import { formatPrice } from '../../../shared/utils/formatters'

/**
 * FilterSidebar - Modern, premium left sidebar with product filters
 * Features: Categories, Price range, Brand with Search/Sort, CPU, RAM, Storage, Screen size, OS, Reset filters
 */
function FilterSidebar({ 
  categories = [], 
  brands = [], 
  filters, 
  onFilterChange, 
  onReset, 
  isOpen, 
  onClose 
}) {
  const [expandedGroups, setExpandedGroups] = useState({
    price: true,
    brand: true,
    cpu: true,
    ram: true,
    storage: false,
    screen: false,
    os: false,
  })

  const [brandSearch, setBrandSearch] = useState('')

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

  // Quick Price Ranges
  const quickPrices = [
    { label: 'Dưới 15 triệu', min: 0, max: 15000000 },
    { label: '15 - 25 triệu', min: 15000000, max: 25000000 },
    { label: 'Trên 25 triệu', min: 25000000, max: 100000000 }
  ]

  const isQuickPriceActive = (item) => {
    return filters.minPrice === item.min && filters.maxPrice === item.max
  }

  // Filter & Sort Brands
  const sortedBrands = [...brands].sort((a, b) => a.name.localeCompare(b.name))
  const filteredBrands = sortedBrands.filter((b) => 
    b.name.toLowerCase().includes(brandSearch.toLowerCase())
  )

  // Advanced specification options
  const cpuOptions = [
    { label: 'Intel Core i3', value: 'i3' },
    { label: 'Intel Core i5', value: 'i5' },
    { label: 'Intel Core i7', value: 'i7' },
    { label: 'Intel Core i9', value: 'i9' },
    { label: 'AMD Ryzen 5', value: 'Ryzen 5' },
    { label: 'AMD Ryzen 7', value: 'Ryzen 7' },
    { label: 'AMD Ryzen 9', value: 'Ryzen 9' },
    { label: 'Apple M-Series', value: 'Apple M' }
  ]

  const ramOptions = [
    { label: '8GB', value: '8GB' },
    { label: '16GB', value: '16GB' },
    { label: '32GB', value: '32GB' },
    { label: '64GB', value: '64GB' }
  ]

  const storageOptions = [
    { label: '256GB', value: '256GB' },
    { label: '512GB', value: '512GB' },
    { label: '1TB', value: '1TB' },
    { label: '2TB', value: '2TB' }
  ]

  const screenOptions = [
    { label: '13 inch', value: '13' },
    { label: '14 inch', value: '14' },
    { label: '15.6 inch', value: '15.6' },
    { label: '16 inch', value: '16' }
  ]

  const osOptions = [
    { label: 'Windows', value: 'Windows' },
    { label: 'macOS', value: 'macOS' },
    { label: 'FreeDOS', value: 'FreeDOS' }
  ]

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed left-0 top-0 z-50 h-screen w-80 overflow-y-auto bg-white lg:bg-transparent shadow-2xl lg:shadow-none transition-transform duration-300 ease-in-out lg:static lg:h-auto lg:w-full lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Mobile Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 bg-white border-b border-slate-100 lg:hidden">
          <h2 className="text-base font-bold text-slate-900">Bộ lọc sản phẩm</h2>
          <button
            onClick={onClose}
            className="inline-flex items-center justify-center w-8 h-8 transition-colors rounded-full bg-slate-50 text-slate-600 hover:bg-slate-100"
            aria-label="Đóng bộ lọc"
          >
            <X size={18} />
          </button>
        </div>

        {/* Sidebar Content */}
        <div className="p-5 lg:p-0 space-y-5">
          {/* Categories Section */}
          {categories.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-50 bg-slate-50/50">
                <h3 className="text-xs font-bold tracking-wider uppercase text-slate-800">Danh mục</h3>
              </div>
              <ul className="py-2 divide-y divide-slate-50">
                {categories.map((category) => {
                  const isActive = filters.category === category.id
                  return (
                    <li key={category.id}>
                      <button
                        onClick={() => handleCategoryChange(category.id)}
                        className={`w-full flex items-center justify-between px-5 py-3 text-xs transition-colors hover:bg-slate-50 ${
                          isActive 
                            ? 'text-blue-600 font-semibold bg-blue-50/30' 
                            : 'text-slate-600 font-medium'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-blue-600' : 'bg-transparent'}`}></span>
                          {category.name}
                        </span>
                        <ChevronRight size={14} className={`transition-transform ${isActive ? 'text-blue-600' : 'text-slate-300'}`} />
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          )}

          {/* Filters Card */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/30 rounded-t-xl">
              <h3 className="text-xs font-bold tracking-wider uppercase text-slate-800">Lọc sản phẩm</h3>
              <button
                onClick={onReset}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-all"
              >
                Xóa tất cả
              </button>
            </div>

            <div className="p-5 space-y-1">
              {/* Price Filter */}
              <FilterSection
                title="Khoảng giá"
                expanded={expandedGroups.price}
                onToggle={() => toggleGroup('price')}
              >
                <div className="space-y-4 pt-1">
                  {/* Quick Price Buttons */}
                  <div className="grid grid-cols-1 gap-2">
                    {quickPrices.map((item, idx) => {
                      const active = isQuickPriceActive(item)
                      return (
                        <button
                          key={idx}
                          onClick={() => {
                            onFilterChange('minPrice', item.min)
                            onFilterChange('maxPrice', item.max)
                          }}
                          className={`px-3 py-2 rounded-lg text-xs font-medium transition-all text-left border ${
                            active
                              ? 'bg-blue-50 text-blue-600 border-blue-200'
                              : 'bg-white text-slate-600 border-slate-150 hover:bg-slate-50'
                          }`}
                        >
                          {item.label}
                        </button>
                      )
                    })}
                  </div>

                  {/* Range inputs */}
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <label htmlFor="min-price" className="sr-only">Giá tối thiểu</label>
                      <input
                        id="min-price"
                        type="number"
                        value={filters.minPrice}
                        onChange={handleMinPriceChange}
                        placeholder="Từ (đ)"
                        className="w-full h-9 px-3 text-xs transition-colors border rounded-lg border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <span className="text-slate-300">-</span>
                    <div className="flex-1">
                      <label htmlFor="max-price" className="sr-only">Giá tối đa</label>
                      <input
                        id="max-price"
                        type="number"
                        value={filters.maxPrice}
                        onChange={handleMaxPriceChange}
                        placeholder="Đến (đ)"
                        className="w-full h-9 px-3 text-xs transition-colors border rounded-lg border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </FilterSection>

              {/* Brand Filter */}
              <FilterSection
                title="Thương hiệu"
                expanded={expandedGroups.brand}
                onToggle={() => toggleGroup('brand')}
              >
                <div className="space-y-3 pt-1">
                  {/* Brand search input */}
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Tìm thương hiệu..."
                      value={brandSearch}
                      onChange={(e) => setBrandSearch(e.target.value)}
                      className="w-full h-8.5 pl-8 pr-3 text-xs border rounded-lg border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  {/* Brand List */}
                  <div className="max-h-48 overflow-y-auto space-y-1 pr-1 scrollbar-thin">
                    {filteredBrands.length > 0 ? (
                      filteredBrands.map((brand) => {
                        const isActive = filters.brand === brand.id
                        return (
                          <button
                            key={brand.id}
                            onClick={() => onFilterChange('brand', isActive ? null : brand.id)}
                            className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-all ${
                              isActive 
                                ? 'bg-blue-50/70 text-blue-600 border border-blue-100' 
                                : 'text-slate-600 hover:bg-slate-50 border border-transparent'
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={isActive}
                                readOnly
                                className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5 border-slate-350 pointer-events-none"
                              />
                              {brand.name}
                            </span>
                            {brand.product_count !== undefined && (
                              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                                isActive ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'
                              }`}>
                                {brand.product_count}
                              </span>
                            )}
                          </button>
                        )
                      })
                    ) : (
                      <p className="text-xs text-slate-400 italic text-center py-2">Không tìm thấy thương hiệu</p>
                    )}
                  </div>
                </div>
              </FilterSection>

              {/* CPU Filter */}
              <FilterSection
                title="CPU"
                expanded={expandedGroups.cpu}
                onToggle={() => toggleGroup('cpu')}
              >
                <div className="space-y-1 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
                  {cpuOptions.map((opt) => {
                    const isActive = filters.cpu === opt.value
                    return (
                      <button
                        key={opt.value}
                        onClick={() => onFilterChange('cpu', isActive ? null : opt.value)}
                        className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-medium transition-all ${
                          isActive 
                            ? 'bg-blue-50/70 text-blue-600 border border-blue-100' 
                            : 'text-slate-600 hover:bg-slate-50 border border-transparent'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isActive}
                          readOnly
                          className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5 border-slate-350 pointer-events-none"
                        />
                        {opt.label}
                      </button>
                    )
                  })}
                </div>
              </FilterSection>

              {/* RAM Filter */}
              <FilterSection
                title="RAM"
                expanded={expandedGroups.ram}
                onToggle={() => toggleGroup('ram')}
              >
                <div className="space-y-1">
                  {ramOptions.map((opt) => {
                    const isActive = filters.ram === opt.value
                    return (
                      <button
                        key={opt.value}
                        onClick={() => onFilterChange('ram', isActive ? null : opt.value)}
                        className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-medium transition-all ${
                          isActive 
                            ? 'bg-blue-50/70 text-blue-600 border border-blue-100' 
                            : 'text-slate-600 hover:bg-slate-50 border border-transparent'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isActive}
                          readOnly
                          className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5 border-slate-350 pointer-events-none"
                        />
                        {opt.label}
                      </button>
                    )
                  })}
                </div>
              </FilterSection>

              {/* Storage Filter */}
              <FilterSection
                title="Dung lượng ổ cứng"
                expanded={expandedGroups.storage}
                onToggle={() => toggleGroup('storage')}
              >
                <div className="space-y-1">
                  {storageOptions.map((opt) => {
                    const isActive = filters.storage === opt.value
                    return (
                      <button
                        key={opt.value}
                        onClick={() => onFilterChange('storage', isActive ? null : opt.value)}
                        className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-medium transition-all ${
                          isActive 
                            ? 'bg-blue-50/70 text-blue-600 border border-blue-100' 
                            : 'text-slate-600 hover:bg-slate-50 border border-transparent'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isActive}
                          readOnly
                          className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5 border-slate-350 pointer-events-none"
                        />
                        {opt.label}
                      </button>
                    )
                  })}
                </div>
              </FilterSection>

              {/* Screen Size Filter */}
              <FilterSection
                title="Kích thước màn hình"
                expanded={expandedGroups.screen}
                onToggle={() => toggleGroup('screen')}
              >
                <div className="space-y-1">
                  {screenOptions.map((opt) => {
                    const isActive = filters.screen === opt.value
                    return (
                      <button
                        key={opt.value}
                        onClick={() => onFilterChange('screen', isActive ? null : opt.value)}
                        className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-medium transition-all ${
                          isActive 
                            ? 'bg-blue-50/70 text-blue-600 border border-blue-100' 
                            : 'text-slate-600 hover:bg-slate-50 border border-transparent'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isActive}
                          readOnly
                          className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5 border-slate-350 pointer-events-none"
                        />
                        {opt.label}
                      </button>
                    )
                  })}
                </div>
              </FilterSection>

              {/* Operating System Filter */}
              <FilterSection
                title="Hệ điều hành"
                expanded={expandedGroups.os}
                onToggle={() => toggleGroup('os')}
              >
                <div className="space-y-1">
                  {osOptions.map((opt) => {
                    const isActive = filters.os === opt.value
                    return (
                      <button
                        key={opt.value}
                        onClick={() => onFilterChange('os', isActive ? null : opt.value)}
                        className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-medium transition-all ${
                          isActive 
                            ? 'bg-blue-50/70 text-blue-600 border border-blue-100' 
                            : 'text-slate-600 hover:bg-slate-50 border border-transparent'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isActive}
                          readOnly
                          className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5 border-slate-350 pointer-events-none"
                        />
                        {opt.label}
                      </button>
                    )
                  })}
                </div>
              </FilterSection>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}

/**
 * FilterSection - Modern collapsible section component
 */
function FilterSection({ title, expanded, onToggle, children }) {
  return (
    <div className="py-3 border-b border-slate-50 last:border-b-0">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full text-slate-800 hover:text-blue-600 group"
      >
        <span className="text-xs font-bold text-slate-850 group-hover:text-blue-650 transition-colors uppercase tracking-wider">{title}</span>
        <ChevronDown
          size={14}
          className={`transition-transform duration-300 text-slate-400 group-hover:text-blue-600 ${
            expanded ? 'rotate-180' : ''
          }`}
        />
      </button>

      {expanded && (
        <div className="mt-3 animate-in fade-in slide-in-from-top-1 duration-200">
          {children}
        </div>
      )}
    </div>
  )
}

export default FilterSidebar

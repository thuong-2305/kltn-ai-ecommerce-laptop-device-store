import { useState } from 'react'
import { ChevronDown, X, ChevronRight } from 'lucide-react'
import { formatPrice } from '../../../shared/utils/formatters'

/**
 * FilterSidebar - Modern left sidebar with product filters
 * Features: Category, Price range, Brand, Screen size, CPU, RAM, Reset filters
 */
function FilterSidebar({ categories = [], filters, onFilterChange, onReset, isOpen, onClose }) {
  const [expandedGroups, setExpandedGroups] = useState({
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

  // Mock data for additional filters
  const brands = [
    { id: 1, name: 'Apple', count: 8 },
    { id: 2, name: 'Dell', count: 16 },
    { id: 3, name: 'HP', count: 12 },
    { id: 4, name: 'Lenovo', count: 24 },
    { id: 5, name: 'ASUS', count: 28 },
    { id: 6, name: 'Acer', count: 22 },
    { id: 7, name: 'MSI', count: 12 },
  ]

  const screenSizes = [
    { label: 'Dưới 13 inch', count: 10 },
    { label: '13 - 14 inch', count: 38 },
    { label: '15 - 16 inch', count: 52 },
    { label: 'Trên 17 inch', count: 20 },
  ]
  const cpus = ['Intel Core i3', 'Intel Core i5', 'Intel Core i7', 'Intel Core i9', 'AMD Ryzen 5', 'AMD Ryzen 7']
  const rams = ['8GB', '16GB', '32GB', '64GB']

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-50 h-screen w-80 overflow-y-auto bg-slate-50 lg:bg-transparent shadow-2xl transition-transform duration-300 ease-in-out lg:static lg:z-0 lg:h-auto lg:w-full lg:shadow-none lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Mobile Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 bg-white border-b border-slate-200 lg:hidden">
          <h2 className="text-lg font-bold text-slate-900 uppercase">Bộ lọc sản phẩm</h2>
          <button
            onClick={onClose}
            className="inline-flex items-center justify-center w-8 h-8 transition-colors rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200"
            aria-label="Đóng bộ lọc"
          >
            <X size={18} />
          </button>
        </div>

        {/* Sidebar Content */}
        <div className="p-5 lg:p-0 space-y-6">
          {/* Categories Card */}
          {categories.length > 0 && (
            <div className="bg-white lg:rounded-xl lg:border lg:border-slate-200 lg:shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 bg-blue-600 lg:bg-transparent lg:border-b-2 lg:border-slate-100">
                <h3 className="text-sm font-bold tracking-wide uppercase text-white lg:text-slate-900">Danh mục sản phẩm</h3>
              </div>
              <ul className="py-2">
                {categories.map((category) => {
                  const isActive = filters.category === category.id;
                  return (
                    <li key={category.id}>
                      <button
                        onClick={() => handleCategoryChange(category.id)}
                        className={`w-full flex items-center justify-between px-5 py-2.5 text-sm transition-colors hover:bg-slate-50 ${
                          isActive ? 'text-blue-600 font-semibold bg-blue-50/50' : 'text-slate-600 font-medium'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                           <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-blue-600' : 'bg-transparent'}`}></span>
                           {category.name}
                        </span>
                        <ChevronRight size={16} className={`transition-transform ${isActive ? 'text-blue-600' : 'text-slate-300'}`} />
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          )}

          {/* Filters Card */}
          <div className="bg-white lg:rounded-xl lg:border lg:border-slate-200 lg:shadow-sm">
            <div className="px-5 py-4 border-b-2 border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold tracking-wide uppercase text-slate-900">Lọc sản phẩm</h3>
              {/* Reset button */}
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
                  {/* Range inputs using standard inputs for now */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <input
                        id="min-price"
                        type="number"
                        value={filters.minPrice}
                        onChange={handleMinPriceChange}
                        placeholder="0đ"
                        className="w-full h-9 px-3 text-sm transition-colors border rounded-md border-slate-300 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      />
                    </div>
                    <span className="text-slate-400">-</span>
                    <div className="flex-1">
                      <input
                        id="max-price"
                        type="number"
                        value={filters.maxPrice}
                        onChange={handleMaxPriceChange}
                        placeholder="100tr"
                        className="w-full h-9 px-3 text-sm transition-colors border rounded-md border-slate-300 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  
                  <button className="w-full h-9 rounded-md bg-blue-600 text-white text-sm font-semibold transition-all hover:bg-blue-700 active:scale-95">
                    Áp dụng
                  </button>
                </div>
              </FilterSection>

              {/* Brand Filter */}
              <FilterSection
                title="Hãng sản xuất"
                expanded={expandedGroups.brand}
                onToggle={() => toggleGroup('brand')}
              >
                <div className="space-y-2.5 pt-1">
                  {brands.map((brand) => (
                    <label key={brand.id} className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative flex items-center justify-center w-4 h-4">
                        <input
                          type="checkbox"
                          className="peer appearance-none w-4 h-4 border border-slate-300 rounded-sm bg-white checked:bg-blue-600 checked:border-blue-600 transition-all cursor-pointer"
                        />
                        <svg className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" viewBox="0 0 14 10" fill="none">
                           <path d="M1 5L4.5 8.5L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <span className="text-sm font-medium transition-colors text-slate-600 group-hover:text-slate-900 flex-1">
                        {brand.name}
                      </span>
                      {brand.count && (
                        <span className="text-xs text-slate-400 font-medium">({brand.count})</span>
                      )}
                    </label>
                  ))}
                  <button className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline mt-1">
                    Xem thêm
                  </button>
                </div>
              </FilterSection>

              {/* Screen Size Filter */}
              <FilterSection
                title="Kích thước màn hình"
                expanded={expandedGroups.screen}
                onToggle={() => toggleGroup('screen')}
              >
                <div className="space-y-2.5 pt-1">
                  {screenSizes.map((size) => (
                    <label key={size.label} className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative flex items-center justify-center w-4 h-4">
                        <input
                          type="checkbox"
                          className="peer appearance-none w-4 h-4 border border-slate-300 rounded-sm bg-white checked:bg-blue-600 checked:border-blue-600 transition-all cursor-pointer"
                        />
                        <svg className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" viewBox="0 0 14 10" fill="none">
                           <path d="M1 5L4.5 8.5L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <span className="text-sm font-medium transition-colors text-slate-600 group-hover:text-slate-900 flex-1">
                        {size.label}
                      </span>
                      {size.count && (
                        <span className="text-xs text-slate-400 font-medium">({size.count})</span>
                      )}
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
                <div className="space-y-2.5 pt-1">
                  {cpus.map((cpu) => (
                    <label key={cpu} className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative flex items-center justify-center w-4 h-4">
                        <input
                          type="checkbox"
                          className="peer appearance-none w-4 h-4 border border-slate-300 rounded-sm bg-white checked:bg-blue-600 checked:border-blue-600 transition-all cursor-pointer"
                        />
                        <svg className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" viewBox="0 0 14 10" fill="none">
                           <path d="M1 5L4.5 8.5L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
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
                <div className="space-y-2.5 pt-1">
                  {rams.map((ram) => (
                    <label key={ram} className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative flex items-center justify-center w-4 h-4">
                        <input
                          type="checkbox"
                          className="peer appearance-none w-4 h-4 border border-slate-300 rounded-sm bg-white checked:bg-blue-600 checked:border-blue-600 transition-all cursor-pointer"
                        />
                        <svg className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" viewBox="0 0 14 10" fill="none">
                           <path d="M1 5L4.5 8.5L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <span className="text-sm font-medium transition-colors text-slate-600 group-hover:text-slate-900">
                        {ram}
                      </span>
                    </label>
                  ))}
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
 * FilterSection - Reusable filter section component
 */
function FilterSection({ title, expanded, onToggle, children }) {
  return (
    <div className="py-4 border-b border-slate-100 last:border-b-0">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full transition-colors text-slate-900 hover:text-blue-600 group"
      >
        <span className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{title}</span>
        <ChevronDown
          size={16}
          className={`transition-transform duration-300 text-slate-400 group-hover:text-blue-600 ${expanded ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Adding overflow-hidden and transition for smooth expand/collapse could be done with grid-rows, but keeping it simple for now */}
      {expanded && <div className="mt-4 animate-in fade-in duration-300">{children}</div>}
    </div>
  )
}

export default FilterSidebar

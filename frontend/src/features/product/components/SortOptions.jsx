import { ChevronDown } from 'lucide-react'

/**
 * SortOptions - Modern sort dropdown component
 */
function SortOptions({ value, onChange }) {
  const options = [
    { value: 'newest', label: 'Mới nhất' },
    { value: 'price-asc', label: 'Giá: Thấp → Cao' },
    { value: 'price-desc', label: 'Giá: Cao → Thấp' },
    { value: 'rating', label: 'Đánh giá cao nhất' },
    { value: 'popular', label: 'Phổ biến nhất' },
  ]

  return (
    <div className="flex items-center gap-3 w-full sm:w-auto">
      <label htmlFor="sort-select" className="text-sm font-semibold text-slate-700 hidden sm:block">
        Sắp xếp:
      </label>
      <div className="relative flex-1 sm:flex-none">
        <select
          id="sort-select"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none px-4 h-10 pl-4 pr-10 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 font-medium transition-all duration-200 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={18}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none"
        />
      </div>
    </div>
  )
}

export default SortOptions


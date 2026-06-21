import { useState, useEffect, useRef, useMemo } from 'react'
import { ChevronDown } from 'lucide-react'

/**
 * SortOptions - Premium custom sort dropdown component
 */
function SortOptions({ value, onChange }) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)

  const options = useMemo(() => [
    { value: 'newest', label: 'Mới nhất' },
    { value: 'price-asc', label: 'Giá: Thấp → Cao' },
    { value: 'price-desc', label: 'Giá: Cao → Thấp' },
    { value: 'rating', label: 'Đánh giá cao nhất' },
    { value: 'popular', label: 'Phổ biến nhất' },
  ], [])

  const activeOption = useMemo(() => 
    options.find((opt) => opt.value === value) ?? options[0],
    [value, options]
  )

  useEffect(() => {
    if (!open) return undefined

    const onPointerDown = (event) => {
      if (!rootRef.current) return
      if (rootRef.current.contains(event.target)) return
      setOpen(false)
    }

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    window.addEventListener('mousedown', onPointerDown)
    window.addEventListener('touchstart', onPointerDown)
    window.addEventListener('keydown', onKeyDown)

    return () => {
      window.removeEventListener('mousedown', onPointerDown)
      window.removeEventListener('touchstart', onPointerDown)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const handleSelect = (val) => {
    onChange(val)
    setOpen(false)
  }

  return (
    <div className="flex items-center gap-3 w-full sm:w-auto">
      <label className="text-sm font-semibold text-slate-750 hidden sm:block">
        Sắp xếp:
      </label>
      <div ref={rootRef} className="relative flex-1 sm:flex-none min-w-[170px] cursor-pointer">
        <button
          type="button"
          className={
            open
              ? 'group inline-flex h-10 w-full cursor-pointer items-center justify-between rounded-xl border border-slate-200/90 bg-white/95 px-4 text-sm font-semibold text-slate-900 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20'
              : 'group inline-flex h-10 w-full cursor-pointer items-center justify-between rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 transition-all hover:bg-slate-50'
          }
          aria-haspopup="menu"
          aria-expanded={open}
          onClick={() => setOpen((prev) => !prev)}
        >
          <span className="min-w-0 whitespace-nowrap">{activeOption.label}</span>
          <ChevronDown
            size={18}
            className={
              open
                ? 'shrink-0 ml-2 text-slate-500 transition-transform duration-200 rotate-180'
                : 'shrink-0 ml-2 text-slate-500 transition-transform duration-200'
            }
          />
        </button>

        <div
          role="menu"
          className={
            open
              ? 'absolute right-0 top-[calc(100%+8px)] z-30 w-full overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 shadow-md backdrop-blur-md opacity-100 translate-y-0 transition-all duration-200 ease-out'
              : 'absolute right-0 top-[calc(100%+8px)] z-30 w-full overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 shadow-md backdrop-blur-md pointer-events-none opacity-0 -translate-y-2 transition-all duration-200 ease-out'
          }
        >
          <div className="max-h-72 overflow-auto p-1.5 space-y-0.5">
            {options.map((option) => {
              const isActive = option.value === value
              return (
                <button
                  key={option.value}
                  type="button"
                  role="menuitem"
                  onClick={() => handleSelect(option.value)}
                  className={
                    isActive
                      ? 'group flex w-full cursor-pointer items-center rounded-xl bg-blue-50 px-3 py-2 text-left text-sm font-semibold text-blue-800 transition-all'
                      : 'group flex w-full cursor-pointer items-center rounded-xl px-3 py-2 text-left text-sm font-semibold text-slate-700 transition-all hover:bg-blue-50/50 hover:text-blue-800'
                  }
                >
                  <span className="min-w-0 flex-1 truncate">{option.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SortOptions



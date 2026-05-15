import { useEffect, useMemo, useRef, useState } from 'react'
import { MdKeyboardArrowDown } from 'react-icons/md'

function CategoryDropdown({ categories = [] }) {
  const rootRef = useRef(null)
  const [open, setOpen] = useState(false)
  const [activeValue, setActiveValue] = useState('all')

  const options = useMemo(
    () => [
      { id: 'all', name: 'Tất cả danh mục' },
      ...categories.map((category) => ({ id: String(category.id), name: category.name })),
    ],
    [categories],
  )

  const activeOption = useMemo(
    () => options.find((option) => option.id === activeValue) ?? options[0],
    [activeValue, options],
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

  const handleSelect = (value) => {
    setActiveValue(value)
    setOpen(false)
  }

  return (
    <div ref={rootRef} className="relative hidden w-full max-sm:block lg:block cursor-pointer">
      <button
        type="button"
        className={
          open
            ? 'group inline-flex h-10 w-full cursor-pointer items-center justify-between rounded-md border border-slate-200/80 bg-white/90 px-3 text-sm font-semibold text-slate-900 shadow-light transition-standard'
            : 'group inline-flex h-10 w-full cursor-pointer items-center justify-between rounded-md border border-slate-200/80 bg-white/60 px-3 text-sm font-semibold text-slate-800 transition-standard hover:bg-white/80'
        }
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
      >
        <span className="min-w-0 whitespace-nowrap">{activeOption.name}</span>
        <MdKeyboardArrowDown
          size={20}
          aria-hidden="true"
          className={
            open
              ? 'shrink-0 -mr-0.5 text-slate-500 transition-transform duration-200 rotate-180'
              : 'shrink-0 -mr-0.5 text-slate-500 transition-transform duration-200'
          }
        />
      </button>

      <div
        role="menu"
        aria-label="Chọn danh mục"
        className={
          open
            ? 'absolute right-0 top-[calc(100%+10px)] z-20 w-full overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 shadow-medium backdrop-blur-md opacity-100 translate-y-0 transition-all duration-200 ease-out'
            : 'absolute right-0 top-[calc(100%+10px)] z-20 w-full overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 shadow-medium backdrop-blur-md pointer-events-none opacity-0 -translate-y-2 transition-all duration-200 ease-out'
        }
      >
        <div className="max-h-72 overflow-auto p-1.5">
          {options.map((option) => {
            const isActive = option.id === activeValue
            return (
              <button
                key={option.id}
                type="button"
                role="menuitem"
                onClick={() => handleSelect(option.id)}
                className={
                  isActive
                    ? 'group flex w-full cursor-pointer items-center rounded-xl bg-blue-50 px-3 py-2 text-left text-sm font-semibold text-blue-800 transition-standard'
                    : 'group flex w-full cursor-pointer items-center rounded-xl px-3 py-2 text-left text-sm font-semibold text-slate-700 transition-standard hover:bg-blue-50 hover:text-blue-800'
                }
              >
                <span className="min-w-0 flex-1 truncate">{option.name}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default CategoryDropdown

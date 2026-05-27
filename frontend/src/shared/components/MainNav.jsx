import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

import { COLOR_ACCENTS, COMMON_STYLES } from '../../constants/designSystem'

function MainNav() {
  const location = useLocation()
  const currentPath = location.pathname

  const navItems = useMemo(
    () => [
      { href: '/', label: 'Trang chủ', isRoute: true },
      { href: '/products', label: 'Sản phẩm', isRoute: true },
      { href: '/promotions', label: 'Khuyến mãi', isRoute: true },
      { href: '/blog', label: 'Tin tức', isRoute: true },
      { href: '/guide', label: 'Hướng dẫn', isRoute: true },
      { href: '/contact', label: 'Liên hệ', isRoute: true },
    ],
    [],
  )

  const [activeHash, setActiveHash] = useState(() => {
    if (typeof window === 'undefined') return '#hero'
    return window.location.hash || '#hero'
  })

  useEffect(() => {
    const onHashChange = () => {
      setActiveHash(window.location.hash || '#hero')
    }

    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  const isActive = (item) => {
    if (item.isRoute) {
      return item.href === '/' ? currentPath === '/' : currentPath.startsWith(item.href)
    }
    return activeHash === item.href
  }

  return (
    <nav className="flex flex-wrap items-center gap-5 bg-transparent px-4.5 py-2.5 shadow-none lg:px-4.5">
      <button type="button" className={`inline-flex flex-row-reverse justify-between w-full min-h-10 shrink-0 items-center gap-2 rounded-md bg-linear-to-r ${COLOR_ACCENTS.BLUE_DARK} px-3.5 py-3 cursor-pointer font-bold text-white shadow-[0_10px_22px_rgba(37,99,235,0.22)] sm:w-60`}>
        <span className="text-sm">☰</span>
        <span>Danh mục sản phẩm</span>
      </button>

      {navItems.map((item) => {
        const active = isActive(item)

        // Route-based navigation using Link
        if (item.isRoute) {
          return (
            <Link
              key={item.href}
              to={item.href}
              aria-current={active ? 'page' : undefined}
              className={
                active
                  ? `${COMMON_STYLES.navLink.className} bg-transparent text-blue-800! rounded-md hover:rounded-md after:absolute after:-bottom-1.5 after:left-3 after:right-3 after:h-0.5 after:rounded-md after:bg-blue-600`
                  : `${COMMON_STYLES.navLink.className} bg-transparent border-0 rounded-md hover:rounded-md`
              }
            >
              {item.label}
            </Link>
          )
        }

        // Hash-based navigation
        return (
          <a
            key={item.href}
            href={item.href}
            onClick={() => setActiveHash(item.href)}
            aria-current={active ? 'page' : undefined}
            className={
              active
                ? `${COMMON_STYLES.navLink.className} bg-transparent text-blue-800! rounded-md hover:rounded-md after:absolute after:-bottom-1.5 after:left-3 after:right-3 after:h-0.5 after:rounded-md after:bg-blue-600`
                : `${COMMON_STYLES.navLink.className} bg-transparent border-0 rounded-md hover:rounded-md`
            }
          >
            {item.label}
          </a>
        )
      })}
    </nav>
  )
}

export default MainNav
import { useState, useRef, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { MdSearch, MdPersonOutline, MdShoppingCart, MdLogout, MdSettings, MdReceipt, MdFavoriteBorder, MdOutlinePhotoCamera } from 'react-icons/md'
import { SEMANTIC_CLASSES, COLOR_ACCENTS, COMMON_STYLES } from '../../constants/designSystem'
import { useAuth } from '../../contexts/AuthContext'

function BrandMark() {
  return (
    <Link to="/" className="flex flex-col gap-0.5 leading-none hover:opacity-90 transition-opacity">
      <div className="flex items-end gap-0.5 text-[1.7rem] font-black tracking-[-0.08em] sm:text-[1.85rem]">
        <span className={SEMANTIC_CLASSES.TEXT.PRIMARY}>LAPTOP</span>
        <span className="bg-linear-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">DEVICE</span>
      </div>
      <div className="flex items-center gap-2 pl-0.5">
        <span className="h-1 w-4 rounded-full bg-linear-to-r from-blue-600 to-cyan-500" aria-hidden="true" />
        <span className={`text-[0.76rem] font-medium ${SEMANTIC_CLASSES.TEXT.MUTED} sm:text-caption-lg`}>Công nghệ cho cuộc sống</span>
      </div>
    </Link>
  )
}

/* ─── User dropdown menu ─────────────────────────────────────── */
function UserDropdown({ user, onLogout }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const initials = user.full_name
    ? user.full_name.split(' ').slice(-2).map(w => w[0]).join('').toUpperCase()
    : user.username?.[0]?.toUpperCase() || '?'

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className={`inline-flex min-h-12.5 items-center gap-2.5 ${SEMANTIC_CLASSES.TEXT.PRIMARY} cursor-pointer`}
        aria-label="Tài khoản"
        aria-expanded={open}
      >
        {/* Avatar */}
        <span className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 text-white font-black text-sm shrink-0 shadow-sm">
          {initials}
        </span>
        <span className="flex flex-col items-start leading-tight max-w-[120px]">
          <strong className="text-button truncate max-w-full">{user.full_name || user.username}</strong>
          <small className={`text-caption-sm ${SEMANTIC_CLASSES.TEXT.MUTED}`}>Tài khoản</small>
        </span>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-slate-200 bg-white shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          {/* User info header */}
          <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/80">
            <p className="font-bold text-sm text-slate-900 truncate">{user.full_name || user.username}</p>
            <p className="text-xs text-slate-500 truncate">{user.email}</p>
          </div>

          {/* Menu items */}
          <div className="py-1.5">
            {[
              { icon: MdReceipt, label: 'Đơn hàng của tôi', href: '/profile?tab=orders' },
              { icon: MdSettings, label: 'Cài đặt tài khoản', href: '/profile' },
            ].map(({ icon: Icon, label, href }) => (
              <Link
                key={href}
                to={href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 font-medium transition-colors"
              >
                <Icon size={17} />
                {label}
              </Link>
            ))}
          </div>

          {/* Logout */}
          <div className="border-t border-slate-100 py-1.5">
            <button
              type="button"
              onClick={() => { setOpen(false); onLogout() }}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 font-semibold transition-colors"
            >
              <MdLogout size={17} />
              Đăng xuất
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

/* ─── SiteHeader ─────────────────────────────────────────────── */
function SiteHeader({ categories = [], cartCount = 0 }) {
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const fileInputRef = useRef(null)
  const [imageLoading, setImageLoading] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const triggerImageUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setImageLoading(true)
    const formData = new FormData()
    formData.append('image', file)

    try {
      const { API_BASE_URL } = await import('../../config/api')
      const axios = (await import('axios')).default

      const res = await axios.post(`${API_BASE_URL}/api/store/products/search-by-image/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      const productIds = res.data.product_ids || []

      // Save image to preview locally
      const reader = new FileReader()
      reader.onloadend = () => {
        const previewUrl = reader.result
        // Pass productIds and preview URL to search page
        sessionStorage.setItem('image_search_preview', previewUrl)
        navigate(`/search?ids=${productIds.join(',')}&img_search=true`)
      }
      reader.readAsDataURL(file)

    } catch (err) {
      console.error('Error in image search:', err)
      alert(err.response?.data?.error || 'Có lỗi xảy ra khi tìm kiếm bằng hình ảnh.')
    } finally {
      setImageLoading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = '' // Clear input
      }
    }
  }

  return (
    <header className={`grid grid-cols-1 gap-3 border-b ${SEMANTIC_CLASSES.BORDER.DEFAULT} bg-transparent px-4.5 py-2 shadow-none lg:grid-cols-[200px_minmax(0,1fr)_auto] lg:items-center lg:gap-4 lg:px-4.5 lg:py-2.5`}>
      <div className="flex flex-col gap-1">
        <BrandMark />
      </div>

      <form
        onSubmit={handleSearch}
        className="grid min-h-14 mx-5 grid-cols-[18px_minmax(0,1fr)_160px_auto] items-center gap-2.5 rounded-md border border-slate-200/80 bg-white/80 px-3 max-lg:grid-cols-[22px_minmax(0,1fr)_auto] max-lg:rounded-2xl max-lg:px-3 max-lg:py-2.5 max-sm:grid-cols-1"
      >
        <label htmlFor="site-search" className={`grid place-items-center ${SEMANTIC_CLASSES.TEXT.LABEL}`} aria-hidden="true">
          <MdSearch size={23} />
        </label>
        <div className="relative flex items-center w-full">
          <input
            id="site-search" type="search"
            value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Bạn cần tìm gì?"
            className={`${COMMON_STYLES.searchBar.input} pr-10`}
          />
          <button
            type="button"
            onClick={triggerImageUpload}
            disabled={imageLoading}
            className="absolute right-2 text-slate-400 hover:text-blue-600 transition-colors p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-50 cursor-pointer"
            title="Tìm kiếm bằng hình ảnh"
          >
            {imageLoading ? (
              <span className="w-5.5 h-5.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin block" />
            ) : (
              <MdOutlinePhotoCamera size={20} />
            )}
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            className="hidden"
          />
        </div>
        <button type="submit" className={`h-10 rounded-md bg-linear-to-r ${COLOR_ACCENTS.BLUE} px-4 text-sm font-bold text-white shadow-[0_10px_20px_rgba(37,99,235,0.2)] max-sm:w-full cursor-pointer`}>
          Tìm kiếm
        </button>
      </form>

      <div className="flex items-center gap-5 max-lg:flex-wrap">
        {/* User / Login button */}
        {isAuthenticated && user ? (
          <UserDropdown user={user} onLogout={handleLogout} />
        ) : (
          <Link
            to="/auth"
            className={`inline-flex min-h-12.5 items-center gap-2.5 border-slate-200/80 ${SEMANTIC_CLASSES.TEXT.PRIMARY}`}
          >
            <span className={`grid h-10 w-10 place-items-center rounded-full ${COLOR_ACCENTS.GRADIENT_ICON_BG} text-blue-600`} aria-hidden="true">
              <MdPersonOutline size={20} />
            </span>
            <span className="flex flex-col items-start leading-tight cursor-pointer">
              <strong className="text-button">Đăng nhập</strong>
              <small className={`text-caption-sm ${SEMANTIC_CLASSES.TEXT.MUTED}`}>Tài khoản</small>
            </span>
          </Link>
        )}

        {/* Cart */}
        <Link
          to="/cart"
          className={`inline-flex min-h-12.5 items-center gap-2.5 border-slate-200/80 ${SEMANTIC_CLASSES.TEXT.PRIMARY}`}
        >
          <span className={`grid h-10 w-10 place-items-center rounded-full ${COLOR_ACCENTS.GRADIENT_ICON_BG} text-blue-600 relative`} aria-hidden="true">
            <MdShoppingCart size={20} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 h-4.5 min-w-4.5 px-1 rounded-full bg-blue-600 text-white text-[10px] font-black flex items-center justify-center">
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </span>
          <span className="flex flex-col items-start leading-tight cursor-pointer">
            <strong className="text-button">Giỏ hàng</strong>
            <small className={`text-caption-sm ${SEMANTIC_CLASSES.TEXT.MUTED}`}>{cartCount} sản phẩm</small>
          </span>
        </Link>
      </div>
    </header>
  )
}

export default SiteHeader
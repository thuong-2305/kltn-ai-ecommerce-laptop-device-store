import { MdSearch, MdPersonOutline, MdShoppingCart } from 'react-icons/md'
import { SEMANTIC_CLASSES, COLOR_ACCENTS, COMMON_STYLES } from '../../constants/designSystem'
import CategoryDropdown from './CategoryDropdown'

function BrandMark() {
  return (
    <div className="flex flex-col gap-0.5 leading-none">
      <div className="flex items-end gap-0.5 text-[1.7rem] font-black tracking-[-0.08em] sm:text-[1.85rem]">
        <span className={`${SEMANTIC_CLASSES.TEXT.PRIMARY}`}>LAPTOP</span>
        <span className="bg-linear-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">DEVICE</span>
      </div>
      <div className="flex items-center gap-2 pl-0.5">
        <span className="h-1 w-4 rounded-full bg-linear-to-r from-blue-600 to-cyan-500" aria-hidden="true" />
        <span className={`text-[0.76rem] font-medium ${SEMANTIC_CLASSES.TEXT.MUTED} sm:text-caption-lg`}>Công nghệ cho cuộc sống</span>
      </div>
    </div>
  )
}

function SiteHeader({ categories = [], cartCount = 0 }) {
  return (
    <header className={`grid grid-cols-1 gap-3 border-b ${SEMANTIC_CLASSES.BORDER.DEFAULT} bg-transparent px-4 py-2 shadow-none lg:grid-cols-[200px_minmax(0,1fr)_auto] lg:items-center lg:gap-4 lg:px-5 lg:py-2.5`}>
      <div className="flex flex-col gap-1">
        <BrandMark />
      </div>

      <label
        className={`grid min-h-14 mx-5 grid-cols-[18px_minmax(0,1fr)_160px_auto] items-center gap-2.5 rounded-md border border-slate-200/80 bg-white/80 px-3 max-lg:grid-cols-[22px_minmax(0,1fr)_auto] max-lg:rounded-2xl max-lg:px-3 max-lg:py-2.5 max-sm:grid-cols-1`}
        htmlFor="site-search"
      >
        <span className={`grid place-items-center ${SEMANTIC_CLASSES.TEXT.LABEL}`} aria-hidden="true">
          <MdSearch size={23} />
        </span>
        <input id="site-search" type="search" placeholder="Bạn cần tìm gì hôm nay?" className={`${COMMON_STYLES.searchBar.input}`} />
        <CategoryDropdown categories={categories.slice(0, 6)} />
        <button type="button" className={`h-10 rounded-md bg-linear-to-r ${COLOR_ACCENTS.BLUE} px-4 text-sm font-bold text-white shadow-[0_10px_20px_rgba(37,99,235,0.2)] max-sm:w-full cursor-pointer`}>
          Tìm kiếm
        </button>
      </label>

      <div className="flex items-center gap-5 max-lg:flex-wrap">
        {/* User */}
        <button type="button" className={`inline-flex min-h-12.5 items-center gap-2.5 border-slate-200/80 ${SEMANTIC_CLASSES.TEXT.PRIMARY}`}>
          <span className={`grid h-10 w-10 place-items-center rounded-full ${COLOR_ACCENTS.GRADIENT_ICON_BG} text-blue-600`} aria-hidden="true">
            <MdPersonOutline size={20} />
          </span>
          <span className="flex flex-col items-start leading-tight cursor-pointer">
            <strong className="text-button">Đăng nhập</strong>
            <small className={`text-caption-sm ${SEMANTIC_CLASSES.TEXT.MUTED}`}>Tài khoản</small>
          </span>
        </button>
        {/* Cart */}
        <button type="button" className={`inline-flex min-h-12.5 items-center gap-2.5 border-slate-200/80 ${SEMANTIC_CLASSES.TEXT.PRIMARY}`}>
          <span className={`grid h-10 w-10 place-items-center rounded-full ${COLOR_ACCENTS.GRADIENT_ICON_BG} text-blue-600`} aria-hidden="true">
            <MdShoppingCart size={20} />
          </span>
          <span className="flex flex-col items-start leading-tight cursor-pointer">
            <strong className="text-button">Giỏ hàng</strong>
            <small className={`text-caption-sm ${SEMANTIC_CLASSES.TEXT.MUTED}`}>{cartCount} sản phẩm</small>
          </span>
        </button>
      </div>
    </header>
  )
}

export default SiteHeader
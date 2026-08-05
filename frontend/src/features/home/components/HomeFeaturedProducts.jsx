import { formatPrice } from '../../../shared/utils/formatters'
import { SEMANTIC_CLASSES } from '../../../constants/designSystem'

function StarIcon({ className = '' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={`h-4 w-4 ${className}`}
    >
      <path d="M12 17.27l-5.18 3.05 1.4-5.92L3 9.24l6.04-.52L12 3l2.96 5.72 6.04.52-5.22 5.16 1.4 5.92L12 17.27z" />
    </svg>
  )
}

function CartIcon({ className = '' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M6 6h15l-1.5 9h-12z" />
      <path d="M6 6l-2-2" />
      <circle cx="9" cy="20" r="1" />
      <circle cx="18" cy="20" r="1" />
    </svg>
  )
}

function StarRating({ value = 0 }) {
  const numericValue = Number(value)
  const normalized = Number.isFinite(numericValue)
    ? Math.max(0, Math.min(5, numericValue))
    : 0

  const filledStars = Math.round(normalized)

  return (
    <div
      className="flex items-center gap-0.5"
      aria-label={`Đánh giá ${normalized.toFixed(1)}/5`}
    >
      {Array.from({ length: 5 }, (_, index) => {
        const isFilled = index < filledStars
        return (
          <StarIcon
            key={index}
            className={isFilled ? 'text-amber-500' : 'text-slate-200'}
          />
        )
      })}
    </div>
  )
}

function getProductTag(product) {
  const name = `${product?.name ?? ''}`.toLowerCase()
  const categoryName = `${product?.category?.name ?? ''}`.toLowerCase()

  const rating = Number(product?.average_rating ?? 0)
  const reviewCount = Number(product?.review_count ?? 0)
  const discount = Number(product?.discount_percentage ?? 0)

  const isBestSeller =
    Number.isFinite(rating) && rating >= 4.7 && Number.isFinite(reviewCount) && reviewCount >= 20

  const isHotDeal = Boolean(product?.is_sale) && Number.isFinite(discount) && discount >= 10

  if (isBestSeller) {
    return {
      label: 'Best Seller',
      className: 'bg-linear-to-r from-blue-600/10 to-sky-500/10 text-blue-700',
    }
  }

  if (isHotDeal) {
    return {
      label: 'Hot',
      className: 'bg-linear-to-r from-orange-500/15 to-rose-500/15 text-rose-700',
    }
  }

  return null
}

function HomeFeaturedProducts({ tabs = [], activeTabId, onSelectTab, products = [] }) {
  const tabBaseClass =
    'rounded-md border bg-white/70 px-4 py-2 text-slate-700 cursor-pointer'
  const tabActiveClass =
    'border bg-gradient-to-br from-blue-600 to-sky-500 text-white shadow-[0_14px_26px_rgba(37,99,235,0.22)]'

  const clampTwoLinesStyle = {
    display: '-webkit-box',
    WebkitBoxOrient: 'vertical',
    WebkitLineClamp: 2,
    overflow: 'hidden',
  }

  return (
    <section className="mx-4.5 mb-8 flex flex-col gap-3.5" id="featured">
      {/* Head */}
      <div className="flex items-center justify-between gap-4 rounded-xxl bg-white/80 px-4.5 py-3.5 shadow-standard">
        <div className='flex items-center justify-center gap-5'>
          <h1 className="text-3xl font-extrabold text-title text-slate-900">SẢN PHẨM MỚI</h1>

          <div className="flex flex-wrap gap-2.5">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`${tabBaseClass} ${SEMANTIC_CLASSES.BORDER.DEFAULT} ${activeTabId === tab.id ? ` ${tabActiveClass}` : ''}`}
                onClick={() => onSelectTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <a className="font-bold text-blue-600" href="#footer">
          Xem tất cả
        </a>
      </div>
      {/* Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => {
          const productTag = getProductTag(product)

          return (
            <article
              key={product.id}
              className="relative flex flex-col overflow-hidden transition-all group rounded-xxl bg-white/85 shadow-standard ring-1 ring-slate-200/70 backdrop-blur-sm duration-standard hover:-translate-y-1 hover:shadow-medium hover:ring-blue-600/15 focus-within:-translate-y-1 focus-within:shadow-medium"
              id={`category-${product.category?.id ?? product.id}`}
            >
              {product.is_sale && (
                <span className="absolute left-3.5 top-3.5 z-20 inline-flex items-center rounded bg-linear-to-r from-red-500 via-rose-500 to-orange-500 px-3 py-1 text-caption-lg font-extrabold text-white shadow-light">
                  -{Math.round(Number(product.discount_percentage || 0))}%
                </span>
              )}

              <button
                type="button"
                aria-label="Thêm vào giỏ hàng"
                className="absolute right-3.5 top-3.5 z-20 grid h-10 w-10 place-items-center rounded-full bg-white/85 text-blue-600 shadow-light backdrop-blur-sm transition-all duration-standard hover:-translate-y-0.5 hover:bg-blue-600 hover:text-white hover:shadow-standard focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600/30 active:translate-y-0"
              >
                <CartIcon className="w-5 h-5 transition-transform duration-standard group-hover:scale-105" />
              </button>

              <div className="relative grid px-4 pt-5 pb-3 overflow-hidden place-items-center bg-linear-to-b from-slate-50/90 to-white/98">
                <div className="absolute inset-0 transition-opacity opacity-0 pointer-events-none -z-1 duration-standard group-hover:opacity-100">
                  <div className="absolute h-24 -translate-x-1/2 rounded-full left-1/2 top-10 w-44 bg-blue-600/12 blur-2xl" />
                  <div className="absolute inset-x-0 bottom-0 h-20 bg-linear-to-t from-sky-500/10 to-transparent blur-xl" />
                </div>
                <img
                  src={product.image}
                  alt={product.name}
                  className="object-contain w-full transition-transform ease-out h-52 duration-standard group-hover:-translate-y-1 group-hover:scale-105"
                />
              </div>

              <div className="flex flex-col gap-3 p-4">
                <h3
                  className="m-0 text-base font-semibold leading-snug text-slate-900"
                  style={clampTwoLinesStyle}
                >
                  {product.name}
                </h3>

                <div className="flex flex-wrap items-end gap-x-3 gap-y-1">
                  <strong className="text-lg font-extrabold tracking-tight text-blue-600">
                    {formatPrice(product.sale_price ?? product.price)}
                  </strong>
                  {product.is_sale && (
                    <del className="text-sm text-slate-400">
                      {formatPrice(product.price)}
                    </del>
                  )}
                </div>

                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <StarRating value={product.average_rating || 0} />
                    <small className="text-caption-sm text-slate-500">
                      ({product.review_count || 0})
                    </small>
                  </div>

                  {productTag && (
                    <span
                      className={`inline-flex items-center rounded px-2.5 py-1 text-caption-sm font-extrabold tracking-wide ${productTag.className}`}
                    >
                      {productTag.label}
                    </span>
                  )}
                </div>
              </div>

              <span className="absolute inset-x-0 bottom-0 h-px pointer-events-none bg-linear-to-r from-transparent via-blue-600/45 to-transparent opacity-70" />
            </article>
          )
        })}

        {products.length === 0 && (
          <div className="text-center border rounded-xxl border-border-default bg-white/80 p-7 text-slate-500 shadow-standard">
            Chưa có sản phẩm nào để hiển thị.
          </div>
        )}
      </div>
    </section>
  )
}

export default HomeFeaturedProducts
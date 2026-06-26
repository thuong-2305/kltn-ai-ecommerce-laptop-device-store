import { useState, useEffect, useMemo, Fragment } from 'react'
import { Link } from 'react-router-dom'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'
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
  const rating = Number(product?.average_rating ?? 0)
  const reviewCount = Number(product?.review_count ?? 0)
  const discount = Number(product?.discount_percentage ?? 0)

  const isBestSeller =
    Number.isFinite(rating) && rating >= 4.7 && Number.isFinite(reviewCount) && reviewCount >= 10

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

function HomeTopProducts({ products = [] }) {
  const displayProducts = products.slice(0, 8)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [visibleCards, setVisibleCards] = useState(4)

  // Track responsive screen size to adjust visible cards in the carousel
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setVisibleCards(1)
      } else if (window.innerWidth < 1024) {
        setVisibleCards(2)
      } else {
        setVisibleCards(4)
      }
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const maxIndex = Math.max(0, displayProducts.length - visibleCards)
  const safeIndex = Math.min(currentIndex, maxIndex)

  // Auto sliding carousel effect
  useEffect(() => {
    if (displayProducts.length <= visibleCards) return

    const timer = setInterval(() => {
      setCurrentIndex((prev) => {
        return prev >= maxIndex ? 0 : prev + 1
      })
    }, 4000) // Auto slide every 4 seconds

    return () => clearInterval(timer)
  }, [displayProducts.length, visibleCards, maxIndex])

  if (displayProducts.length === 0) return null

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1))
  }

  const itemWidth = 100 / visibleCards

  const clampTwoLinesStyle = {
    display: '-webkit-box',
    WebkitBoxOrient: 'vertical',
    WebkitLineClamp: 2,
    overflow: 'hidden',
  }

  return (
    <section className="mx-4.5 mb-8 flex flex-col gap-3.5" id="top-selling" aria-label="Sản phẩm bán chạy">
      {/* Section Title */}
      <div className={`${SEMANTIC_CLASSES.BORDER.DEFAULT} rounded-xxl bg-white/80 px-4.5 py-3.5 shadow-standard flex items-center justify-between`}>
        <div className="flex items-center gap-2">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
            <span className="text-red-600 font-black">TOP</span> SẢN PHẨM BÁN CHẠY
          </h2>
        </div>
        <Link className="font-bold text-blue-600 hover:text-blue-700 transition-colors" to="/products">
          Xem tất cả
        </Link>
      </div>

      {/* Carousel container with Navigation Buttons */}
      <div className="relative group/carousel w-full overflow-hidden">
        {/* Navigation Buttons (visible on hover) */}
        {displayProducts.length > visibleCards && (
          <Fragment>
            <button
              type="button"
              onClick={handlePrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-30 grid h-10 w-10 place-items-center rounded-full bg-white/90 text-slate-800 shadow-md border border-slate-200 transition-all opacity-0 group-hover/carousel:opacity-100 hover:bg-blue-600 hover:text-white"
              aria-label="Slide trước"
            >
              <FiChevronLeft size={22} />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-30 grid h-10 w-10 place-items-center rounded-full bg-white/90 text-slate-800 shadow-md border border-slate-200 transition-all opacity-0 group-hover/carousel:opacity-100 hover:bg-blue-600 hover:text-white"
              aria-label="Slide tiếp theo"
            >
              <FiChevronRight size={22} />
            </button>
          </Fragment>
        )}

        {/* Carousel Slider */}
        <div className="overflow-hidden w-full">
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${safeIndex * itemWidth}%)` }}
          >
            {displayProducts.map((product) => {
              const productTag = getProductTag(product)

              return (
                <div
                  key={product.id}
                  className="flex-shrink-0 p-2"
                  style={{ width: `${itemWidth}%` }}
                >
                  <Link
                    to={`/products/${product.id}`}
                    className="block h-full cursor-pointer"
                  >
                    <article
                      className="relative flex flex-col overflow-hidden transition-all group rounded-xxl bg-white/85 shadow-standard ring-1 ring-slate-200/70 backdrop-blur-sm duration-standard hover:-translate-y-1 hover:shadow-medium hover:ring-blue-600/15 focus-within:-translate-y-1 focus-within:shadow-medium h-full"
                    >
                      {/* Stacked Badges (Discount + Hot) */}
                      <div className="absolute top-3 left-3 z-20 flex flex-col gap-1">
                        <div className="bg-red-500 text-white text-[11px] font-black px-2 py-1 rounded-sm shadow-sm flex items-center justify-center uppercase tracking-wider">
                          HOT
                        </div>
                      </div>

                      <button
                        type="button"
                        aria-label="Thêm vào giỏ hàng"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                        }}
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

                      <div className="flex flex-col gap-3 p-4 flex-1">
                        <h3
                          className="m-0 text-base font-semibold leading-snug text-slate-900 line-clamp-2 min-h-[44px]"
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

                        <div className="flex items-center justify-between gap-3 mt-auto pt-2">
                          <div className="flex items-center gap-2">
                            <StarRating value={product.average_rating || 0} />
                            <small className="text-caption-sm text-slate-500">
                              ({product.review_count || 0})
                            </small>
                          </div>

                          {productTag && (
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-1 text-caption-sm font-extrabold tracking-wide ${productTag.className}`}
                            >
                              {productTag.label}
                            </span>
                          )}
                        </div>
                      </div>

                      <span className="absolute inset-x-0 bottom-0 h-px pointer-events-none bg-linear-to-r from-transparent via-blue-600/45 to-transparent opacity-70" />
                    </article>
                  </Link>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

export default HomeTopProducts

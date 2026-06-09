import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, ShoppingCart, Share2, GitCompare, ChevronLeft, ChevronRight, Star, CheckCircle, Truck, RotateCcw, Shield, Edit3, Smile, Frown, Meh } from 'lucide-react'
import { formatPrice } from '../../../shared/utils/formatters'

/* ─────────────────────────────────────────────────────────────────
   IMAGE GALLERY
───────────────────────────────────────────────────────────────── */
export function ProductImageGallery({ image, thumbnails = [], name }) {
  const images = [image, ...thumbnails].filter(Boolean)
  const [activeIdx, setActiveIdx] = useState(0)

  const prev = () => setActiveIdx((i) => (i - 1 + images.length) % images.length)
  const next = () => setActiveIdx((i) => (i + 1) % images.length)

  return (
    <div className="flex flex-col gap-4">
      {/* Main image */}
      <div className="relative bg-white rounded-2xl border border-slate-200 overflow-hidden aspect-square flex items-center justify-center group">
        {images[activeIdx] ? (
          <img
            src={images[activeIdx]}
            alt={name}
            className="w-full h-full object-contain p-6 transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-50">
            <svg className="w-20 h-20 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        {images.length > 1 && (
          <>
            <button onClick={prev} className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 border border-slate-200 shadow-md flex items-center justify-center text-slate-700 hover:bg-white transition-all opacity-0 group-hover:opacity-100">
              <ChevronLeft size={18} />
            </button>
            <button onClick={next} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 border border-slate-200 shadow-md flex items-center justify-center text-slate-700 hover:bg-white transition-all opacity-0 group-hover:opacity-100">
              <ChevronRight size={18} />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-1">
          {images.map((src, i) => (
            <button
              key={i}
              onClick={() => setActiveIdx(i)}
              className={`flex-none w-16 h-16 rounded-xl border-2 overflow-hidden transition-all ${
                i === activeIdx ? 'border-blue-600 shadow-md' : 'border-slate-200 hover:border-slate-400'
              }`}
            >
              <img src={src} alt={`${name} ${i + 1}`} className="w-full h-full object-contain p-1" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────
   STAR RATING
───────────────────────────────────────────────────────────────── */
export function StarRating({ rating = 0, size = 16, showValue = false }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }, (_, i) => {
        const filled = i < Math.floor(rating)
        const half = !filled && i < rating
        return (
          <svg key={i} width={size} height={size} viewBox="0 0 24 24" className={filled ? 'text-amber-400' : half ? 'text-amber-300' : 'text-slate-200'} fill="currentColor">
            <path d="M12 17.27l-5.18 3.05 1.4-5.92L3 9.24l6.04-.52L12 3l2.96 5.72 6.04.52-5.22 5.16 1.4 5.92L12 17.27z" />
          </svg>
        )
      })}
      {showValue && <span className="text-sm font-semibold text-slate-700 ml-1">{Number(rating).toFixed(1)}</span>}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────
   PRODUCT INFO (price, badges, actions)
───────────────────────────────────────────────────────────────── */
export function ProductInfo({ product, onAddToCart, onAddToWishlist }) {
  const [qty, setQty] = useState(1)
  const [wishlisted, setWishlisted] = useState(false)
  const [activeVariant, setActiveVariant] = useState(() => {
    return product.variants && product.variants.length > 0 ? product.variants[0] : null
  })

  // Dynamic price based on selected variant or product base price
  const salePrice = activeVariant ? activeVariant.price : (product.sale_price ?? product.price)
  const originalPrice = activeVariant ? activeVariant.price : product.price
  const discountPercentage = activeVariant ? 0 : (product.discount_percentage || 0)
  const hasDiscount = !activeVariant && discountPercentage > 0

  const handleCartClick = () => {
    onAddToCart?.(product, qty, activeVariant)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Category */}
      {product.category?.name && (
        <span className="text-xs font-bold tracking-widest uppercase text-blue-600">{product.category.name}</span>
      )}

      {/* Title */}
      <h1 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight">{product.name}</h1>

      {/* Rating row */}
      <div className="flex items-center gap-3 flex-wrap">
        <StarRating rating={product.average_rating} size={18} />
        <span className="text-sm font-semibold text-slate-700">{Number(product.average_rating).toFixed(1)}</span>
        <span className="text-sm text-slate-500">({product.review_count} đánh giá)</span>
        {product.total_sold > 0 && (
          <span className="text-sm text-slate-500 border-l border-slate-200 pl-3">Đã bán {product.total_sold.toLocaleString()}</span>
        )}
      </div>

      {/* Price */}
      <div className="flex items-end gap-4 py-4 border-y border-slate-100">
        <span className="text-3xl md:text-4xl font-black text-blue-600">{formatPrice(salePrice)}</span>
        {hasDiscount && (
          <div className="flex flex-col items-start">
            <span className="text-base text-slate-400 line-through">{formatPrice(originalPrice)}</span>
            <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">-{discountPercentage}%</span>
          </div>
        )}
      </div>

      {/* Variant Selector */}
      {product.variants && product.variants.length > 0 && (
        <div className="flex flex-col gap-3">
          <span className="text-sm font-bold text-slate-800 uppercase tracking-wider">Cấu hình:</span>
          <div className="flex flex-wrap gap-2.5">
            {product.variants.map((v) => {
              const isActive = activeVariant?.id === v.id
              return (
                <button
                  key={v.id}
                  onClick={() => setActiveVariant(v)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                    isActive
                      ? 'border-blue-600 bg-blue-50/50 text-blue-600 shadow-sm'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-350'
                  }`}
                >
                  {v.name}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Short description */}
      {product.short_description && (
        <p className="text-sm text-slate-600 leading-relaxed">{product.short_description}</p>
      )}

      {/* Quantity & Stock Status */}
      <div className="flex items-center gap-6 flex-wrap">
        <div className="flex items-center gap-4">
          <span className="text-sm font-semibold text-slate-700">Số lượng:</span>
          <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden">
            <button
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="w-10 h-10 flex items-center justify-center text-slate-700 hover:bg-slate-100 transition-colors font-semibold text-lg"
            >−</button>
            <span className="w-12 text-center text-sm font-bold text-slate-900">{qty}</span>
            <button
              onClick={() => setQty((q) => q + 1)}
              className="w-10 h-10 flex items-center justify-center text-slate-700 hover:bg-slate-100 transition-colors font-semibold text-lg"
            >+</button>
          </div>
        </div>

        {activeVariant && (
          <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${
            activeVariant.stock > 0 
              ? 'bg-green-50 text-green-700 border border-green-200' 
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {activeVariant.stock > 0 ? `Còn hàng (${activeVariant.stock})` : 'Hết hàng'}
          </span>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleCartClick}
          disabled={activeVariant && activeVariant.stock <= 0}
          className={`flex-1 h-12 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md hover:shadow-lg ${
            activeVariant && activeVariant.stock <= 0
              ? 'bg-slate-300 cursor-not-allowed shadow-none hover:shadow-none'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          <ShoppingCart size={18} />
          Thêm vào giỏ hàng
        </button>
        <button
          onClick={() => { setWishlisted((w) => !w); onAddToWishlist?.(product) }}
          className={`h-12 px-5 rounded-xl border-2 font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 ${
            wishlisted
              ? 'border-red-500 text-red-500 bg-red-50'
              : 'border-slate-300 text-slate-700 hover:border-slate-400 hover:bg-slate-50'
          }`}
        >
          <Heart size={18} fill={wishlisted ? 'currentColor' : 'none'} />
          {wishlisted ? 'Đã yêu thích' : 'Yêu thích'}
        </button>
      </div>

      {/* Trust badges */}
      <div className="grid grid-cols-2 gap-3 pt-2">
        {[
          { icon: <Truck size={16} />, label: 'Miễn phí vận chuyển', sub: 'Toàn quốc' },
          { icon: <RotateCcw size={16} />, label: '30 ngày đổi trả', sub: 'Dễ dàng, nhanh chóng' },
          { icon: <Shield size={16} />, label: 'Bảo hành chính hãng', sub: 'An tâm tuyệt đối' },
          { icon: <CheckCircle size={16} />, label: 'Hàng chính hãng 100%', sub: 'Cam kết chất lượng' },
        ].map(({ icon, label, sub }) => (
          <div key={label} className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-blue-600 mt-0.5 flex-none">{icon}</span>
            <div>
              <p className="text-xs font-bold text-slate-800">{label}</p>
              <p className="text-xs text-slate-500">{sub}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────
   SPECS TAB (config)
───────────────────────────────────────────────────────────────── */
export function ProductSpecs({ config = [], specifications = [], description = '' }) {
  const hasSpecs = specifications && specifications.length > 0
  const hasConfig = config && config.length > 0

  return (
    <div className="space-y-6">
      {description && (
        <div>
          <h3 className="text-base font-bold text-slate-900 mb-3">Mô tả sản phẩm</h3>
          <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{description}</div>
        </div>
      )}

      {/* Render structured specifications if they exist */}
      {hasSpecs && (
        <div>
          <h3 className="text-base font-bold text-slate-900 mb-4">Thông số kỹ thuật chi tiết</h3>
          <div className="rounded-xl border border-slate-200 overflow-hidden bg-white">
            <table className="w-full text-sm">
              <tbody>
                {specifications.map((spec, idx) => (
                  <tr key={spec.id || idx} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-5 font-semibold text-slate-705 w-1/3 align-top bg-slate-50/30">
                      {spec.key}
                    </td>
                    <td className="py-3 px-5 text-slate-600 align-top">
                      {spec.value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Fallback to legacy parsed config if structured specs are empty */}
      {!hasSpecs && hasConfig && (
        <div>
          <h3 className="text-base font-bold text-slate-900 mb-4">Thông số kỹ thuật</h3>
          <div className="rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-sm">
              <tbody>
                {config.map((group, gi) => (
                  group.specs.map((spec, si) => (
                    <tr key={`${gi}-${si}`} className={`border-b border-slate-100 last:border-b-0 ${si === 0 ? 'bg-slate-50' : 'bg-white'}`}>
                      <td className="py-3 px-5 font-semibold text-slate-700 w-1/3 align-top">
                        {si === 0 ? group.label : ''}
                      </td>
                      <td className="py-3 px-5 text-slate-600 align-top">
                        <span className="font-medium text-slate-800">{spec.key}</span>
                        {spec.value && <span className="text-slate-500">: {spec.value}</span>}
                      </td>
                    </tr>
                  ))
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────
   REVIEWS SECTION
───────────────────────────────────────────────────────────────── */
function RatingBar({ label, count, total }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs font-semibold text-slate-600 w-3">{label}</span>
      <svg className="w-3 h-3 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 17.27l-5.18 3.05 1.4-5.92L3 9.24l6.04-.52L12 3l2.96 5.72 6.04.52-5.22 5.16 1.4 5.92L12 17.27z" />
      </svg>
      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full bg-amber-400 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-slate-500 w-6 text-right">{count}</span>
    </div>
  )
}

export function ProductReviews({ reviews = [], averageRating = 0, reviewCount = 0, ratingDistribution = {}, productId }) {
  const SENTIMENT_COLORS = { positive: 'text-green-600 bg-green-50 border-green-200', negative: 'text-red-600 bg-red-50 border-red-200', neutral: 'text-slate-600 bg-slate-50 border-slate-200' }
  const SENTIMENT_LABEL  = {
    positive: (
      <span className="flex items-center gap-1">
        <Smile size={11} className="shrink-0" />
        <span>Tích cực</span>
      </span>
    ),
    negative: (
      <span className="flex items-center gap-1">
        <Frown size={11} className="shrink-0" />
        <span>Tiêu cực</span>
      </span>
    ),
    neutral: (
      <span className="flex items-center gap-1">
        <Meh size={11} className="shrink-0" />
        <span>Trung lập</span>
      </span>
    )
  }

  return (
    <div className="space-y-8">
      {/* Summary + Write review CTA */}
      <div className="flex flex-col sm:flex-row gap-8 p-6 bg-slate-50 rounded-2xl border border-slate-200">
        <div className="flex flex-col items-center justify-center gap-2 min-w-[120px]">
          <span className="text-5xl font-black text-slate-900">{Number(averageRating).toFixed(1)}</span>
          <StarRating rating={averageRating} size={20} />
          <span className="text-sm text-slate-500">{reviewCount} đánh giá</span>
        </div>
        <div className="flex-1 flex flex-col justify-center gap-2">
          {[5, 4, 3, 2, 1].map((star) => (
            <RatingBar key={star} label={star} count={ratingDistribution[star] ?? 0} total={reviewCount} />
          ))}
        </div>
        {/* Write review button */}
        {productId && (
          <div className="flex items-center sm:items-end shrink-0">
            <Link
              to={`/review/${productId}`}
              className="flex items-center gap-2 px-5 h-11 rounded-xl bg-blue-600 text-white text-sm font-bold shadow-md hover:bg-blue-700 hover:-translate-y-0.5 active:translate-y-0 transition-all"
            >
              <Edit3 size={15} /> Viết đánh giá
            </Link>
          </div>
        )}
      </div>

      {/* Individual reviews */}
      {reviews.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          <svg className="w-12 h-12 mx-auto mb-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <p className="font-semibold text-slate-700">Chưa có đánh giá nào</p>
          <p className="text-sm mt-1 mb-4">Hãy là người đầu tiên đánh giá sản phẩm này!</p>
          {productId && (
            <Link to={`/review/${productId}`}
              className="inline-flex items-center gap-2 px-5 h-10 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-all">
              <Edit3 size={14} /> Viết đánh giá đầu tiên
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-5">
          {reviews.map((review) => {
            const [title, ...rest] = (review.comment || '').split('\n')
            const body = rest.join('\n').trim()
            return (
              <div key={review.id} className="p-5 bg-white rounded-xl border border-slate-200 hover:shadow-sm transition-all">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-sm flex-none">
                      {(review.user?.full_name || review.user || 'U')[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{review.user?.full_name || review.user || 'Người dùng ẩn danh'}</p>
                      <p className="text-xs text-slate-400">{review.review_date || (review.created_at ? new Date(review.created_at).toLocaleDateString('vi-VN') : '')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-none">
                    <StarRating rating={review.rating} size={14} />
                    {review.sentiment && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${SENTIMENT_COLORS[review.sentiment] ?? ''}`}>
                        {SENTIMENT_LABEL[review.sentiment] ?? review.sentiment}
                      </span>
                    )}
                  </div>
                </div>
                {title && <p className="text-sm font-bold text-slate-800 mb-1">{title}</p>}
                {body && <p className="text-sm text-slate-600 leading-relaxed">{body}</p>}
                {!body && review.comment && <p className="text-sm text-slate-600 leading-relaxed">{review.comment}</p>}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────
   SKELETON LOADING
───────────────────────────────────────────────────────────────── */
export function ProductDetailSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-4 bg-slate-200 rounded w-48 mb-8" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="aspect-square bg-slate-200 rounded-2xl" />
        <div className="space-y-5">
          <div className="h-3 bg-slate-200 rounded w-20" />
          <div className="h-8 bg-slate-200 rounded w-full" />
          <div className="h-7 bg-slate-200 rounded w-3/4" />
          <div className="h-10 bg-slate-200 rounded w-1/2" />
          <div className="space-y-2 pt-4">
            <div className="h-4 bg-slate-200 rounded" />
            <div className="h-4 bg-slate-200 rounded w-5/6" />
          </div>
          <div className="flex gap-3 pt-4">
            <div className="h-12 bg-slate-200 rounded-xl flex-1" />
            <div className="h-12 bg-slate-200 rounded-xl w-32" />
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────
   ERROR STATE
───────────────────────────────────────────────────────────────── */
export function ProductDetailError({ error, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-5 text-center">
      <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
        <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        </svg>
      </div>
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-1">Không thể tải sản phẩm</h2>
        <p className="text-sm text-slate-500 max-w-sm">{error}</p>
      </div>
      <button onClick={onRetry} className="px-6 h-11 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 active:scale-95 transition-all">
        Thử lại
      </button>
    </div>
  )
}

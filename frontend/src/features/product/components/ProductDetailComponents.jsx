import { useState, useRef, useEffect, Fragment } from 'react'
import { Link } from 'react-router-dom'
import { Heart, ShoppingCart, ChevronLeft, ChevronRight, CheckCircle, Truck, RotateCcw, Shield, Edit3, Smile, Frown, Meh, ChevronDown, ChevronUp, Check, Zap, Bot, ThumbsUp, ThumbsDown, AlertTriangle, TrendingUp, Filter, Loader2 } from 'lucide-react'
import { formatPrice } from '../../../shared/utils/formatters'
import { useAuth } from '../../../contexts/AuthContext'
import { useProductSentiment } from '../hooks/useProductSentiment'
import { useProductReviews } from '../hooks/useProductReviews'

/* ─────────────────────────────────────────────────────────────────
   IMAGE GALLERY
───────────────────────────────────────────────────────────────── */
export function ProductImageGallery({ image, thumbnails = [], name }) {
  const images = [image, ...thumbnails].filter(Boolean)
  const [activeIdx, setActiveIdx] = useState(0)
  const [zoom, setZoom] = useState(false)
  const [coords, setCoords] = useState({ x: 50, y: 50 })
  const containerRef = useRef(null)

  const prev = () => setActiveIdx((i) => (i - 1 + images.length) % images.length)
  const next = () => setActiveIdx((i) => (i + 1) % images.length)

  const handleMouseMove = (e) => {
    if (!containerRef.current) return
    const { left, top, width, height } = containerRef.current.getBoundingClientRect()
    const x = ((e.clientX - left) / width) * 100
    const y = ((e.clientY - top) / height) * 100
    setCoords({ x, y })
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Main image */}
      <div
        ref={containerRef}
        onMouseEnter={() => setZoom(true)}
        onMouseLeave={() => setZoom(false)}
        onMouseMove={handleMouseMove}
        className="relative bg-white rounded-2xl border border-slate-200 overflow-hidden aspect-square flex items-center justify-center group cursor-zoom-in"
      >
        {images[activeIdx] ? (
          <img
            src={images[activeIdx]}
            alt={name}
            className="w-full h-full object-contain p-6 pointer-events-none"
            style={{
              transform: zoom ? 'scale(2.2)' : 'scale(1)',
              transformOrigin: zoom ? `${coords.x}% ${coords.y}%` : 'center center',
              transition: zoom ? 'transform 0.08s ease-out' : 'transform 0.3s ease, transform-origin 0.3s ease',
            }}
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
            <button onClick={prev} className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 border border-slate-200 shadow-md flex items-center justify-center text-slate-700 hover:bg-white transition-all opacity-0 group-hover:opacity-100 z-10">
              <ChevronLeft size={18} />
            </button>
            <button onClick={next} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 border border-slate-200 shadow-md flex items-center justify-center text-slate-700 hover:bg-white transition-all opacity-0 group-hover:opacity-100 z-10">
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
              className={`flex-none w-16 h-16 rounded-xl border-2 overflow-hidden transition-all ${i === activeIdx ? 'border-blue-600 shadow-md' : 'border-slate-200 hover:border-slate-400'
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
export function ProductInfo({ product, onAddToCart, onAddToWishlist, onBuyNow }) {
  const [qty, setQty] = useState(1)
  const [wishlisted, setWishlisted] = useState(false)
  const [activeVariant, setActiveVariant] = useState(() => {
    return product.variants && product.variants.length > 0 ? product.variants[0] : null
  })

  const discountPercentage = product.discount_percentage || 0
  const hasDiscount = discountPercentage > 0
  const originalPrice = product.price
  const salePrice = product.sale_price ?? product.price

  const shouldShowVariantSelector = product.variants && product.variants.length > 0 && !(
    product.variants.length === 1 &&
    (product.variants[0].name.toLowerCase() === 'mặc định' || product.variants[0].name.toLowerCase() === 'default')
  )

  useEffect(() => {
    if (activeVariant) {
      if (activeVariant.stock <= 0) {
        setQty(0)
      } else {
        setQty(1)
      }
    }
  }, [activeVariant])

  const handleDecrement = () => {
    if (!activeVariant || activeVariant.stock <= 0) return
    setQty((q) => Math.max(1, q - 1))
  }

  const handleIncrement = () => {
    if (!activeVariant) {
      setQty((q) => q + 1)
      return
    }
    if (activeVariant.stock <= 0) return
    setQty((q) => Math.min(activeVariant.stock, q + 1))
  }

  const handleCartClick = () => {
    onAddToCart?.(product, qty, activeVariant)
  }

  const handleBuyNowClick = () => {
    onBuyNow?.(product, qty, activeVariant)
  }

  return (
    <div className="flex flex-col gap-6">
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
      {shouldShowVariantSelector && (
        <div className="flex flex-col gap-3">
          <span className="text-sm font-bold text-slate-800 uppercase tracking-wider">Cấu hình:</span>
          <div className="flex flex-wrap gap-2.5">
            {product.variants.map((v) => {
              const isActive = activeVariant?.id === v.id
              return (
                <button
                  key={v.id}
                  onClick={() => setActiveVariant(v)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all ${isActive
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
          <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden bg-white">
            <button
              onClick={handleDecrement}
              disabled={!activeVariant || activeVariant.stock <= 0 || qty <= 1}
              className="w-10 h-10 flex items-center justify-center text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors font-semibold text-lg"
            >−</button>
            <span className="w-12 text-center text-sm font-bold text-slate-900">{qty}</span>
            <button
              onClick={handleIncrement}
              disabled={!activeVariant || activeVariant.stock <= 0 || qty >= activeVariant.stock}
              className="w-10 h-10 flex items-center justify-center text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors font-semibold text-lg"
            >+</button>
          </div>
        </div>

        {activeVariant && (
          <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${activeVariant.stock > 0
            ? 'bg-green-50 text-green-700 border border-green-200'
            : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
            {activeVariant.stock > 0 ? `Còn hàng (${activeVariant.stock})` : 'Hết hàng'}
          </span>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        {activeVariant && activeVariant.stock <= 0 ? (
          <button
            disabled
            className="flex-1 h-12 rounded-xl bg-slate-100 text-slate-400 font-bold text-sm flex items-center justify-center gap-2 cursor-not-allowed border border-slate-200"
          >
            Sản phẩm tạm hết hàng
          </button>
        ) : (
          <>
            <button
              onClick={handleBuyNowClick}
              disabled={activeVariant && activeVariant.stock <= 0}
              className={`flex-1 h-12 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md hover:shadow-lg ${activeVariant && activeVariant.stock <= 0
                ? 'bg-slate-300 cursor-not-allowed shadow-none hover:shadow-none'
                : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600'
                }`}
            >
              <Zap size={18} className="fill-current" />
              Mua ngay
            </button>
            <button
              onClick={handleCartClick}
              disabled={activeVariant && activeVariant.stock <= 0}
              className={`flex-1 h-12 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md hover:shadow-lg ${activeVariant && activeVariant.stock <= 0
                ? 'bg-slate-300 cursor-not-allowed shadow-none hover:shadow-none'
                : 'bg-blue-600 hover:bg-blue-700'
                }`}
            >
              <ShoppingCart size={18} />
              Thêm vào giỏ hàng
            </button>
          </>
        )}
        <button
          onClick={() => { setWishlisted((w) => !w); onAddToWishlist?.(product) }}
          className={`h-12 px-5 rounded-xl border-2 font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 ${wishlisted
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
// Helper to render bold text between **
function renderBoldText(text) {
  const parts = text.split(/\*\*([^*]+)\*\*/)
  return parts.map((part, index) =>
    index % 2 === 1 ? <strong key={index} className="font-black text-slate-900">{part}</strong> : part
  )
}

// Strip stray CR/LF artifacts (real or literal-escaped) from a spec/config value.
function cleanSpecText(text) {
  if (!text) return text
  return String(text)
    .replace(/\\r\\n|\\r|\\n|\r\n|\r|\n/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

// Simple Markdown parser
function parseDescription(text) {
  if (!text) return ''
  // Normalize Windows-style \r\n line endings to avoid \r artifacts
  const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
  return normalized.split('\n').map((line, idx) => {
    let cleanLine = line.trim()

    // Sub-header (### Header)
    if (cleanLine.startsWith('###')) {
      return (
        <h4 key={idx} className="text-base font-bold text-slate-800 mt-6 mb-3 flex items-center gap-2 border-l-4 border-blue-600 pl-2.5">
          {cleanLine.replace('###', '').trim()}
        </h4>
      )
    }

    // Bullet list (- Item or * Item)
    if (cleanLine.startsWith('-') || cleanLine.startsWith('*')) {
      const content = cleanLine.substring(1).trim()
      return (
        <li key={idx} className="flex items-start gap-2 text-slate-600 my-2 text-[15px] pl-2">
          <Check size={14} className="text-blue-500 shrink-0 mt-1" />
          <span>{renderBoldText(content)}</span>
        </li>
      )
    }

    // Empty paragraph spacer
    if (cleanLine === '') {
      return <div key={idx} className="h-2" />
    }

    return (
      <p key={idx} className="text-slate-600 mb-3 text-[15px] leading-relaxed">
        {renderBoldText(cleanLine)}
      </p>
    )
  })
}

export function ProductSpecs({ config = [], specifications = [], description = '' }) {
  const hasSpecs = specifications && specifications.length > 0
  const hasConfig = config && config.length > 0
  const [expanded, setExpanded] = useState(false)
  const [isOverflow, setIsOverflow] = useState(false)
  const descRef = useRef(null)

  useEffect(() => {
    if (descRef.current) {
      setIsOverflow(descRef.current.scrollHeight > 320)
    }
  }, [description])

  return (
    <div className="space-y-8">
      {description && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm relative">
          <h3 className="text-base font-black text-slate-900 uppercase tracking-tight mb-4 border-b border-slate-100 pb-3">Mô tả sản phẩm</h3>

          <div
            ref={descRef}
            className="transition-all duration-500 ease-in-out overflow-hidden"
            style={{ maxHeight: expanded ? '3000px' : '320px' }}
          >
            <div className="space-y-1">
              {parseDescription(description)}
            </div>
          </div>

          {/* Gradient fade overlay */}
          {isOverflow && !expanded && (
            <div className="absolute bottom-[68px] left-0 w-full h-24 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none" />
          )}

          {/* Toggle Button */}
          {isOverflow && (
            <div className="mt-4 pt-4 border-t border-slate-100 text-center">
              <button
                onClick={() => setExpanded(!expanded)}
                className="inline-flex items-center gap-1.5 text-xs font-black text-blue-600 uppercase tracking-wider hover:text-blue-800 transition-colors"
              >
                {expanded ? (
                  <>Thu gọn mô tả <ChevronUp size={14} /></>
                ) : (
                  <>Xem toàn bộ mô tả <ChevronDown size={14} /></>
                )}
              </button>
            </div>
          )}
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
                    <td className="py-3 px-5 font-semibold text-slate-700 w-1/3 align-top bg-slate-50/30">
                      {cleanSpecText(spec.key)}
                    </td>
                    <td className="py-3 px-5 text-slate-600 align-top">
                      {cleanSpecText(spec.value)}
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
          <div className="rounded-xl border border-slate-200 overflow-hidden bg-white">
            <table className="w-full text-sm">
              <tbody>
                {config.map((group, gi) => (
                  <Fragment key={gi}>
                    {/* Full-width Group Header Row */}
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <td colSpan={2} className="py-2.5 px-5 font-black text-slate-800 uppercase tracking-tight text-xs bg-slate-100/60">
                        {cleanSpecText(group.label)}
                      </td>
                    </tr>
                    {/* Spec Items Rows under the header */}
                    {group.specs.map((spec, si) => (
                      <tr key={`${gi}-${si}`} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/30 transition-colors">
                        <td className="py-3 px-5 font-semibold text-slate-700 w-1/3 align-top">
                          {cleanSpecText(spec.key)}
                        </td>
                        <td className="py-3 px-5 text-slate-600 align-top">
                          {cleanSpecText(spec.value) || '-'}
                        </td>
                      </tr>
                    ))}
                  </Fragment>
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
function RatingBar({ label, count, total, isSelected, onClick }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 cursor-pointer p-1 rounded-lg transition-colors ${isSelected ? 'bg-amber-50 ring-1 ring-amber-300' : 'hover:bg-slate-100/80'}`}
      title={`Lọc đánh giá ${label} sao`}
    >
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

/* ─────────────────────────────────────────────────────────────────
   AI SENTIMENT WIDGET
───────────────────────────────────────────────────────────────── */
const OVERALL_CONFIG = {
  very_positive: {
    icon: <TrendingUp size={18} className="shrink-0" />,
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-700',
    bar: 'bg-emerald-500',
    badge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  },
  positive: {
    icon: <Smile size={18} className="shrink-0" />,
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-700',
    bar: 'bg-green-500',
    badge: 'bg-green-100 text-green-800 border-green-300',
  },
  neutral: {
    icon: <Meh size={18} className="shrink-0" />,
    bg: 'bg-slate-50',
    border: 'border-slate-200',
    text: 'text-slate-600',
    bar: 'bg-slate-400',
    badge: 'bg-slate-100 text-slate-700 border-slate-300',
  },
  negative: {
    icon: <Frown size={18} className="shrink-0" />,
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-700',
    bar: 'bg-red-500',
    badge: 'bg-red-100 text-red-800 border-red-300',
  },
  very_negative: {
    icon: <AlertTriangle size={18} className="shrink-0" />,
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    text: 'text-rose-700',
    bar: 'bg-rose-600',
    badge: 'bg-rose-100 text-rose-800 border-rose-300',
  },
}

function SentimentBar({ label, icon, count, percent, barColor }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 w-32 shrink-0 whitespace-nowrap">
        {icon}
        {label}
      </span>
      <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full ${barColor} rounded-full transition-all duration-700`}
          style={{ width: `${percent}%` }}
        />
      </div>
      <span className="text-xs font-bold text-slate-700 w-10 text-right shrink-0 font-mono">{percent}%</span>
      <span className="text-xs text-slate-400 shrink-0 whitespace-nowrap">({count} lượt)</span>
    </div>
  )
}

function SentimentWidget({ productId }) {
  const { sentiment, loading } = useProductSentiment(productId)

  if (loading) {
    return (
      <div className="animate-pulse rounded-2xl border border-slate-200 bg-slate-50 p-5 space-y-3">
        <div className="h-4 bg-slate-200 rounded w-48" />
        <div className="h-8 bg-slate-200 rounded w-36" />
        <div className="space-y-2">
          <div className="h-3 bg-slate-200 rounded" />
          <div className="h-3 bg-slate-200 rounded w-5/6" />
          <div className="h-3 bg-slate-200 rounded w-4/6" />
        </div>
      </div>
    )
  }

  if (!sentiment || !sentiment.has_data) return null

  const { distribution, overall, keywords, total, avg_rating, ai_disclaimer } = sentiment
  const cfg = OVERALL_CONFIG[overall?.label] ?? OVERALL_CONFIG.neutral

  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-2 px-5 py-3.5 bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
        <Bot size={16} className="text-blue-600" />
        <span className="text-sm font-black text-slate-800 uppercase tracking-tight">Phân tích cảm xúc từ AI</span>
      </div>

      <div className="p-5 space-y-5">
        {/* Overall label */}
        <div className={`flex items-start gap-3 p-4 rounded-xl border ${cfg.bg} ${cfg.border}`}>
          <span className={`mt-0.5 ${cfg.text}`}>{cfg.icon}</span>
          <div>
            <p className={`text-base font-black ${cfg.text} uppercase tracking-wide`}>{overall?.label_vn}</p>
            <p className="text-sm text-slate-600 mt-0.5 leading-snug">{overall?.description}</p>
          </div>
        </div>

        {/* Distribution bars */}
        <div className="space-y-2.5">
          <SentimentBar
            label="Hài lòng"
            icon={<Smile size={12} className="text-green-600" />}
            count={distribution?.positive?.count ?? 0}
            percent={distribution?.positive?.percent ?? 0}
            barColor="bg-green-500"
          />
          <SentimentBar
            label="Trung lập"
            icon={<Meh size={12} className="text-slate-500" />}
            count={distribution?.neutral?.count ?? 0}
            percent={distribution?.neutral?.percent ?? 0}
            barColor="bg-slate-400"
          />
          <SentimentBar
            label="Không hài lòng"
            icon={<Frown size={12} className="text-red-500" />}
            count={distribution?.negative?.count ?? 0}
            percent={distribution?.negative?.percent ?? 0}
            barColor="bg-red-500"
          />
        </div>

        <p className="text-xs text-slate-400 text-right">
          Dựa trên {total} đánh giá · ⭐ {avg_rating}/5 sao trung bình
        </p>

        {/* Keywords */}
        {(keywords?.positive?.length > 0 || keywords?.negative?.length > 0) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-slate-100">
            {keywords?.positive?.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <ThumbsUp size={13} className="text-green-600" />
                  <span className="text-xs font-bold text-slate-700">Thường được khen:</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {keywords.positive.map(({ keyword }) => (
                    <span key={keyword} className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-green-50 border border-green-200 text-green-700">
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {keywords?.negative?.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <ThumbsDown size={13} className="text-red-500" />
                  <span className="text-xs font-bold text-slate-700">Thường bị chê:</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {keywords.negative.map(({ keyword }) => (
                    <span key={keyword} className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-red-50 border border-red-200 text-red-600">
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* AI Disclaimer */}
        <div className="flex items-start gap-2 p-3 rounded-xl bg-blue-50 border border-blue-100">
          <Bot size={13} className="text-blue-500 mt-0.5 shrink-0" />
          <p className="text-[11px] text-blue-600 leading-relaxed">{ai_disclaimer}</p>
        </div>
      </div>
    </div>
  )
}

export function ProductReviews({ averageRating = 0, reviewCount = 0, ratingDistribution = {}, productId }) {
  const { user } = useAuth()
  const [selectedStar, setSelectedStar] = useState('all')

  const { reviews: filteredReviews, hasMore, loading, loadingMore, loadMore } = useProductReviews(productId, selectedStar)

  const SENTIMENT_COLORS = { positive: 'text-green-600 bg-green-50 border-green-200', negative: 'text-red-600 bg-red-50 border-red-200', neutral: 'text-slate-600 bg-slate-50 border-slate-200' }
  const SENTIMENT_LABEL = {
    positive: (
      <span className="flex items-center gap-1">
        <Smile size={11} className="shrink-0" />
        <span>Hài lòng</span>
      </span>
    ),
    negative: (
      <span className="flex items-center gap-1">
        <Frown size={11} className="shrink-0" />
        <span>Không hài lòng</span>
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
      <div className="flex flex-col sm:flex-row items-center justify-between gap-8 p-6 bg-slate-50 rounded-2xl border border-slate-200">
        <div className="flex flex-col items-center justify-center gap-2 min-w-[120px]">
          <span className="text-5xl font-black text-slate-900">{Number(averageRating).toFixed(1)}</span>
          <StarRating rating={averageRating} size={20} />
          <span className="text-sm text-slate-500">{reviewCount} đánh giá</span>
        </div>
        <div className="flex-1 w-full flex flex-col justify-center gap-2">
          {[5, 4, 3, 2, 1].map((star) => (
            <RatingBar
              key={star}
              label={star}
              count={ratingDistribution[star] ?? 0}
              total={reviewCount}
              isSelected={selectedStar === star}
              onClick={() => setSelectedStar(selectedStar === star ? 'all' : star)}
            />
          ))}
        </div>
        {/* Write review button - vertically centered */}
        {productId && (
          <div className="flex items-center justify-center shrink-0 self-center my-auto">
            <Link
              to={`/review/${productId}`}
              className="flex items-center gap-2 px-5 h-11 rounded-xl bg-blue-600 text-white text-sm font-bold shadow-md hover:bg-blue-700 hover:-translate-y-0.5 active:translate-y-0 transition-all"
            >
              <Edit3 size={15} /> Viết đánh giá
            </Link>
          </div>
        )}
      </div>

      {/* AI Sentiment Widget */}
      {productId && <SentimentWidget productId={productId} />}

      {/* Star Filter Pills */}
      {reviewCount > 0 && (
        <div className="flex items-center gap-2 flex-wrap bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-700 mr-2 flex items-center gap-1.5">
            <Filter size={14} className="text-blue-600" />
            Lọc theo số sao:
          </span>
          {['all', 5, 4, 3, 2, 1].map((star) => {
            const isSelected = selectedStar === star
            const count = star === 'all' ? reviewCount : (ratingDistribution[star] ?? 0)
            return (
              <button
                key={star}
                onClick={() => setSelectedStar(star)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-350 hover:bg-slate-100'
                }`}
              >
                {star === 'all' ? (
                  'Tất cả'
                ) : (
                  <span className="flex items-center gap-1">
                    {star} <svg className={`w-3 h-3 ${isSelected ? 'text-amber-300 fill-amber-300' : 'text-amber-400 fill-amber-400'}`} viewBox="0 0 24 24"><path d="M12 17.27l-5.18 3.05 1.4-5.92L3 9.24l6.04-.52L12 3l2.96 5.72 6.04.52-5.22 5.16 1.4 5.92L12 17.27z" /></svg>
                  </span>
                )}
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-200/80 text-slate-600'}`}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>
      )}

      {/* Individual reviews */}
      {reviewCount === 0 ? (
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
      ) : loading ? (
        <div className="flex items-center justify-center gap-2 py-12 text-slate-400">
          <Loader2 size={18} className="animate-spin" />
          <span className="text-sm font-semibold">Đang tải đánh giá...</span>
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-2xl border border-slate-200 p-6 text-slate-500">
          <p className="font-bold text-slate-800">Không tìm thấy đánh giá {selectedStar} sao nào</p>
          <button
            onClick={() => setSelectedStar('all')}
            className="mt-3 px-4 py-2 rounded-xl bg-blue-50 text-blue-600 font-bold text-xs hover:bg-blue-100 transition-all"
          >
            Xem tất cả đánh giá ({reviewCount})
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {filteredReviews.map((review) => {
            const commentStr = review.comment || ''
            // Normalize Windows-style \r\n line endings
            const normalizedComment = commentStr.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
            const hasNewline = normalizedComment.includes('\n')

            let title = ''
            let body = normalizedComment

            if (hasNewline) {
              const parts = normalizedComment.split('\n')
              title = parts[0]
              body = parts.slice(1).join('\n').trim()
            }

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
              </div>
            )
          })}

          {hasMore && (
            <div className="text-center pt-2">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="inline-flex items-center gap-1.5 px-5 h-10 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-700 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loadingMore
                  ? <><Loader2 size={15} className="animate-spin" /> Đang tải...</>
                  : <>Xem thêm đánh giá <ChevronDown size={15} /></>
                }
              </button>
            </div>
          )}
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

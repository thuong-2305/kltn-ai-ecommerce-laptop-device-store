import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Heart, Eye, GitCompare } from 'lucide-react'
import { formatPrice } from '../../../shared/utils/formatters'

const parseConfig = (configStr) => {
  if (!configStr) return null
  const specs = {}
  const segments = configStr.split('- ')
  segments.forEach((seg) => {
    const trimmed = seg.trim()
    if (!trimmed) return
    const parts = trimmed.split(' + ')
    
    // 1. Check individual key-value pairs (e.g. "Loại CPU: Intel i5")
    parts.forEach((p) => {
      if (p.includes(': ')) {
        const idx = p.indexOf(': ')
        const key = p.substring(0, idx).trim().toLowerCase()
        const val = p.substring(idx + 2).trim()
        
        if (key.includes('cpu') || key.includes('bộ xử lý') || key.includes('vi xử lý')) {
          if (!specs.cpu) specs.cpu = val
        } else if (key.includes('dung lượng ram') || key.includes('ram') || key.includes('bộ nhớ trong')) {
          if (!specs.ram) specs.ram = val
        } else if (key.includes('ổ cứng') || key.includes('ssd') || key.includes('dung lượng ổ cứng') || key.includes('storage') || key.includes('lưu trữ')) {
          if (!specs.storage) specs.storage = val
        } else if (key.includes('màn hình') || key.includes('screen') || key.includes('kích thước màn hình') || key.includes('hiển thị')) {
          if (!specs.screen) specs.screen = val
        } else if (key.includes('hệ điều hành') || key.includes('os') || key.includes('operating system')) {
          if (!specs.os) specs.os = val
        }
      }
    })
    
    // 2. Fallback/Legacy group-level logic
    if (parts.length >= 2) {
      const label = parts[0].trim().toLowerCase()
      const getVal = () => parts.slice(1).map(p => p.includes(': ') ? p.substring(p.indexOf(': ') + 2).trim() : p.trim()).join(', ')
      
      if (label.includes('cpu') || label.includes('bộ xử lý')) {
        if (!specs.cpu) specs.cpu = getVal()
      } else if (label.includes('ram') || label.includes('bộ nhớ')) {
        if (!specs.ram) specs.ram = getVal()
      } else if (label.includes('màn hình') || label.includes('screen')) {
        if (!specs.screen) specs.screen = getVal()
      } else if (label.includes('ổ cứng') || label.includes('ssd') || label.includes('lưu trữ')) {
        if (!specs.storage) specs.storage = getVal()
      } else if (label.includes('hệ điều hành') || label.includes('os')) {
        if (!specs.os) specs.os = getVal()
      }
    }
  })
  return specs
}


/**
 * ProductCard - Modern redesigned product card component
 * Features: Badge, hover effects, rating, price, action buttons
 */
function ProductCard({ product, onAddToCart, onAddToWishlist, onQuickView, onCompare }) {
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [isCompared, setIsCompared] = useState(false)
  const navigate = useNavigate()

  const goToDetail = () => navigate(`/products/${product.id}`)

  const discountPercentage = product.discount_percentage || 0
  const salePrice = product.sale_price || product.price
  const originalPrice = product.price
  const hasDiscount = discountPercentage > 0

  // Rating display
  const renderStars = (rating) => {
    const filledStars = Math.round(rating || 0)
    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }, (_, i) => (
          <svg
            key={i}
            className={`w-3.5 h-3.5 ${i < filledStars ? 'text-amber-400' : 'text-slate-200'}`}
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 17.27l-5.18 3.05 1.4-5.92L3 9.24l6.04-.52L12 3l2.96 5.72 6.04.52-5.22 5.16 1.4 5.92L12 17.27z" />
          </svg>
        ))}
      </div>
    )
  }

  const handleWishlistClick = () => {
    setIsWishlisted(!isWishlisted)
    onAddToWishlist?.(product)
  }

  const handleCompareClick = () => {
    setIsCompared(!isCompared)
    onCompare?.(product)
  }

  const handleQuickViewClick = () => {
    onQuickView?.(product)
  }

  return (
    <div className="group h-full flex flex-col bg-white border border-slate-200 rounded-xl transition-all duration-300 hover:border-slate-300 hover:shadow-xl hover:-translate-y-1.5 overflow-hidden">
      {/* Image Container */}
      <div 
        className="relative w-full aspect-[4/3] overflow-hidden bg-white p-4 cursor-pointer" 
        onClick={goToDetail}
        tabIndex={0}
        role="link"
        aria-label={`Xem chi tiết sản phẩm ${product.name}`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            goToDetail()
          }
        }}
      >
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-50 rounded-lg">
            <svg className="w-12 h-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        {/* Discount Badge */}
        {hasDiscount && (
          <div className="absolute top-3 left-3 inline-flex items-center justify-center px-2 py-1 rounded bg-red-600 text-white font-bold text-xs shadow-sm">
            -{discountPercentage}%
          </div>
        )}

        {/* Action Buttons - Top Right */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 translate-x-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
          <button
            onClick={handleWishlistClick}
            className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-white border border-slate-200 text-slate-600 shadow-sm transition-all duration-200 hover:bg-red-50 hover:border-red-300 hover:text-red-600 hover:shadow-md"
            aria-label="Thêm vào danh sách yêu thích"
            title="Yêu thích"
          >
            <Heart size={16} fill={isWishlisted ? 'currentColor' : 'none'} />
          </button>

          <button
            onClick={handleQuickViewClick}
            className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-white border border-slate-200 text-slate-600 shadow-sm transition-all duration-200 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 hover:shadow-md"
            aria-label="Xem nhanh"
            title="Xem nhanh"
          >
            <Eye size={16} />
          </button>

          <button
            onClick={handleCompareClick}
            className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-white border border-slate-200 text-slate-600 shadow-sm transition-all duration-200 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900 hover:shadow-md"
            aria-label="So sánh"
            title="So sánh"
          >
            <GitCompare size={16} />
          </button>
        </div>
      </div>

      {/* Content Container */}
      <div className="flex flex-col gap-3 flex-1 p-5 border-t border-slate-100">
        <div className="flex flex-col gap-1">
           {/* Category Badge */}
           {product.category && (
             <div className="text-xs font-semibold text-blue-600 tracking-wide uppercase">
               {product.category.name}
             </div>
           )}

           {/* Product Title */}
           <h3 
             onClick={goToDetail} 
             className="text-sm font-semibold text-slate-900 line-clamp-2 leading-snug hover:text-blue-600 transition-colors cursor-pointer" 
             title={product.name}
             tabIndex={0}
             role="link"
             onKeyDown={(e) => {
               if (e.key === 'Enter' || e.key === ' ') {
                 e.preventDefault()
                 goToDetail()
               }
             }}
           >
             {product.name}
           </h3>
        </div>

        {/* Specs - Optional Short Description */}
        {product.short_description ? (
          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
            {product.short_description}
          </p>
        ) : (() => {
          const specs = parseConfig(product.config)
          if (!specs || Object.keys(specs).length === 0) return null
          return (
            <ul className="text-xs text-slate-500 space-y-1">
              {specs.cpu && (
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                  <span className="font-semibold text-slate-700">CPU:</span> {specs.cpu}
                </li>
              )}
              {specs.ram && (
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                  <span className="font-semibold text-slate-700">RAM:</span> {specs.ram}
                </li>
              )}
              {(specs.storage || specs.ssd) && (
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                  <span className="font-semibold text-slate-700">Ổ cứng:</span> {specs.storage || specs.ssd}
                </li>
              )}
              {specs.screen && (
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                  <span className="font-semibold text-slate-700">Màn hình:</span> {specs.screen}
                </li>
              )}
              {specs.os && (
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                  <span className="font-semibold text-slate-700">HĐH:</span> {specs.os}
                </li>
              )}
            </ul>
          )
        })()}

        {/* Rating & Reviews */}
        <div className="flex items-center gap-2 mt-auto">
          {renderStars(product.average_rating || 0)}
          <span className="text-xs text-slate-500 font-medium">
            ({product.review_count || 0})
          </span>
        </div>

        {/* Price Section */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2.5">
            <span className="text-lg font-black text-blue-600">
              {formatPrice(salePrice)}
            </span>
            {hasDiscount && (
              <span className="text-sm text-slate-400 line-through font-medium">
                {formatPrice(originalPrice)}
              </span>
            )}
          </div>
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={() => onAddToCart?.(product)}
          className="w-full h-10 mt-2 rounded-lg bg-slate-900 text-white text-sm font-semibold transition-all duration-300 hover:bg-blue-600 active:scale-95 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600/30 flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          Thêm vào giỏ
        </button>
      </div>
    </div>
  )
}

export default ProductCard

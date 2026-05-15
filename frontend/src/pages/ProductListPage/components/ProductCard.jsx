import { useState } from 'react'
import { Heart, Eye, GitCompare } from 'lucide-react'

/**
 * ProductCard - Modern redesigned product card component
 * Features: Badge, hover effects, rating, price, action buttons
 */
function ProductCard({ product, onAddToCart, onAddToWishlist, onQuickView, onCompare }) {
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [isCompared, setIsCompared] = useState(false)

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
    }).format(price)
  }

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
    <div className="group h-full flex flex-col bg-white border border-slate-200 rounded-xl transition-all duration-300 hover:border-slate-300 hover:shadow-xl hover:-translate-y-2 overflow-hidden">
      {/* Image Container */}
      <div className="relative w-full h-64 overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 rounded-t-xl">
        {product.image ? (
          <>
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-16 h-16 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        {/* Discount Badge - Top Left */}
        {hasDiscount && (
          <div className="absolute top-3 left-3 inline-flex items-center justify-center h-10 w-10 rounded-full bg-red-600 text-white font-bold text-xs shadow-md">
            -{discountPercentage}%
          </div>
        )}

        {/* Action Buttons - Top Right */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <button
            onClick={handleWishlistClick}
            className="inline-flex items-center justify-center h-9 w-9 rounded-full bg-white border border-slate-200 text-slate-600 shadow-md transition-all duration-200 hover:bg-red-50 hover:border-red-300 hover:text-red-600 hover:shadow-lg"
            aria-label="Thêm vào danh sách yêu thích"
            title="Yêu thích"
          >
            <Heart size={18} fill={isWishlisted ? 'currentColor' : 'none'} />
          </button>

          <button
            onClick={handleQuickViewClick}
            className="inline-flex items-center justify-center h-9 w-9 rounded-full bg-white border border-slate-200 text-slate-600 shadow-md transition-all duration-200 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 hover:shadow-lg"
            aria-label="Xem nhanh"
            title="Xem nhanh"
          >
            <Eye size={18} />
          </button>

          <button
            onClick={handleCompareClick}
            className="inline-flex items-center justify-center h-9 w-9 rounded-full bg-white border border-slate-200 text-slate-600 shadow-md transition-all duration-200 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900 hover:shadow-lg"
            aria-label="So sánh"
            title="So sánh"
          >
            <GitCompare size={18} />
          </button>
        </div>

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
      </div>

      {/* Content Container */}
      <div className="flex flex-col gap-2.5 flex-1 p-4">
        {/* Category Badge */}
        {product.category && (
          <div className="inline-flex w-fit px-2 py-1 rounded-md bg-slate-100 text-slate-600 text-xs font-medium">
            {product.category.name}
          </div>
        )}

        {/* Product Title */}
        <h3 className="text-sm font-semibold text-slate-900 line-clamp-2 leading-snug hover:text-blue-600 transition-colors cursor-pointer">
          {product.name}
        </h3>

        {/* Rating & Reviews */}
        <div className="flex items-center gap-2">
          {renderStars(product.average_rating)}
          {product.review_count > 0 && (
            <span className="text-xs text-slate-500 font-medium">
              ({product.review_count})
            </span>
          )}
        </div>

        {/* Specs - Optional Short Description */}
        {product.short_description && (
          <p className="text-xs text-slate-600 line-clamp-1 leading-relaxed">
            {product.short_description}
          </p>
        )}

        {/* Divider */}
        <div className="h-px bg-slate-100 my-1" />

        {/* Price Section - Important visual hierarchy */}
        <div className="flex items-center gap-2.5">
          <span className="text-base font-bold text-slate-900">
            {formatPrice(salePrice)}
          </span>
          {hasDiscount && (
            <span className="text-xs text-slate-400 line-through font-medium">
              {formatPrice(originalPrice)}
            </span>
          )}
        </div>

        {/* Add to Cart Button - Bottom of card */}
        <button
          onClick={() => onAddToCart?.(product)}
          className="w-full h-10 mt-auto rounded-lg bg-blue-600 text-white text-sm font-semibold transition-all duration-300 hover:bg-blue-700 active:scale-95 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600/30"
        >
          Thêm vào giỏ
        </button>
      </div>
    </div>
  )
}

export default ProductCard

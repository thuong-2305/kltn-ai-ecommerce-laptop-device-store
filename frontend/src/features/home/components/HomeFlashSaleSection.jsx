import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Zap } from 'lucide-react'
import { formatPrice } from '../../../shared/utils/formatters'

function useFakeCountdown() {
  const [timeLeft, setTimeLeft] = useState({ hours: 2, minutes: 45, seconds: 30 })

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { hours, minutes, seconds } = prev
        if (seconds > 0) {
          seconds--
        } else {
          seconds = 59
          if (minutes > 0) {
            minutes--
          } else {
            minutes = 59
            if (hours > 0) hours--
          }
        }
        return { hours, minutes, seconds }
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  return {
    hours: timeLeft.hours.toString().padStart(2, '0'),
    minutes: timeLeft.minutes.toString().padStart(2, '0'),
    seconds: timeLeft.seconds.toString().padStart(2, '0')
  }
}

function FlashSaleCard({ product }) {
  const originalPrice = product.price || 0
  
  // Chỉ coi là có giảm giá thực tế nếu is_sale là true và sale_price nhỏ hơn price gốc
  const isRealSale = product.is_sale && product.sale_price && Number(product.sale_price) < Number(originalPrice)

  // Giả lập dữ liệu Flash Sale nếu API chưa có - sử dụng useMemo để tránh việc phần trăm/giá thay đổi liên tục theo mỗi giây của đồng hồ đếm ngược
  const discount = useMemo(() => {
    if (isRealSale) {
      if (product.discount_percentage && product.discount_percentage > 0) {
        return product.discount_percentage
      }
      return Math.round((1 - Number(product.sale_price) / Number(originalPrice)) * 100)
    }
    // Tạo phần trăm giảm giá cố định dựa theo product.id để tránh ngẫu nhiên thay đổi mỗi lần re-render
    const seed = product.id ? Number(product.id) || product.name.length : 7
    return (seed % 15) + 10 // 10-24%
  }, [isRealSale, product.discount_percentage, product.sale_price, originalPrice, product.id, product.name])

  const soldPercent = useMemo(() => {
    const seed = product.id ? Number(product.id) || product.name.length : 7
    return (seed % 50) + 40 // 40-89% cố định
  }, [product.id, product.name])
  
  const salePrice = useMemo(() => {
    if (isRealSale) {
      return product.sale_price
    }
    return Math.floor(originalPrice * (100 - discount) / 100)
  }, [isRealSale, product.sale_price, originalPrice, discount])

  return (
    <div className="bg-white rounded-xl p-3 flex flex-col relative border-2 border-transparent hover:border-blue-500 transition-all duration-300 group shadow-sm h-full">
      {/* Discount Badge */}
      <div className="absolute top-3 left-3 bg-red-500 text-white text-[11px] font-black px-2 py-1 rounded-sm z-10 shadow-sm">
        -{discount}%
      </div>
      
      {/* Product Image */}
      <Link to={`/products/${product.id}`} className="block aspect-[5/4] mb-4 p-2 relative overflow-hidden">
        <img 
          src={product.image || 'https://via.placeholder.com/300x200?text=Laptop'} 
          alt={product.name} 
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300" 
        />
      </Link>

      {/* Product Info */}
      <div className="flex-1 flex flex-col">
        <Link to={`/products/${product.id}`} className="text-sm font-bold text-slate-900 line-clamp-2 leading-snug mb-1.5 hover:text-blue-600 transition-colors min-h-[40px]">
          {product.name}
        </Link>
        <p className="text-[11px] text-slate-500 line-clamp-1 mb-4">
          {product.short_description || 'Intel Core i7 / 16GB / 512GB SSD / RTX 4060'}
        </p>
        
        {/* Pricing */}
        <div className="flex items-baseline gap-2 mb-4 mt-auto">
          <span className="text-[17px] font-black text-red-600">{formatPrice(salePrice)}</span>
          <span className="text-[12px] text-slate-400 line-through font-medium">{formatPrice(originalPrice)}</span>
        </div>

        {/* Action Button */}
        <Link 
          to={`/products/${product.id}`} 
          className="w-full h-[38px] rounded-md border border-blue-600 text-blue-600 font-bold text-sm flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors"
        >
          Xem chi tiết
        </Link>
      </div>
    </div>
  )
}

export default function HomeFlashSaleSection({ products = [] }) {
  const { hours, minutes, seconds } = useFakeCountdown()
  
  // Lấy 4 sản phẩm đầu tiên
  const displayProducts = products.slice(0, 4)

  if (displayProducts.length === 0) return null

  return (
    <section className="mx-4.5 mb-8">
      <div className="bg-gradient-to-r from-blue-700 to-blue-900 rounded-2xl p-4 md:p-6 shadow-lg shadow-blue-900/20 border border-blue-600/30 relative overflow-hidden">
        {/* Nền họa tiết chìm */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
        {/* Header Section */}
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-5 mb-5 md:mb-6">
          <div className="flex items-center gap-3.5 flex-wrap">
            <div className="flex items-center gap-2">
              <h2 className="text-[22px] md:text-[26px] font-black text-white uppercase tracking-tight">DEAL HOT GIỜ VÀNG</h2>
              <Zap className="text-yellow-300 fill-yellow-300 w-7 h-7 filter drop-shadow-[0_0_8px_rgba(253,224,71,0.8)] animate-pulse shrink-0" />
            </div>
            <Link to="/flash-sale" className="text-xs font-black bg-white/10 hover:bg-white/20 text-white hover:text-yellow-300 transition-all border border-white/25 hover:border-yellow-300/30 px-3 py-1.5 rounded-full select-none">
              XEM TẤT CẢ
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex flex-col items-center justify-center bg-white/10 backdrop-blur-md w-11 h-12 md:w-12 md:h-14 rounded-md border border-white/20 shadow-inner">
              <span className="text-white text-lg md:text-xl font-bold">{hours}</span>
              <span className="text-[8px] md:text-[9px] text-white/80 font-bold uppercase tracking-widest mt-0.5">Giờ</span>
            </div>
            <span className="text-white font-bold text-xl mb-3 opacity-60 animate-pulse">:</span>
            <div className="flex flex-col items-center justify-center bg-white/10 backdrop-blur-md w-11 h-12 md:w-12 md:h-14 rounded-md border border-white/20 shadow-inner">
              <span className="text-white text-lg md:text-xl font-bold">{minutes}</span>
              <span className="text-[8px] md:text-[9px] text-white/80 font-bold uppercase tracking-widest mt-0.5">Phút</span>
            </div>
            <span className="text-white font-bold text-xl mb-3 opacity-60 animate-pulse">:</span>
            <div className="flex flex-col items-center justify-center bg-white/10 backdrop-blur-md w-11 h-12 md:w-12 md:h-14 rounded-md border border-white/20 shadow-inner">
              <span className="text-white text-lg md:text-xl font-bold">{seconds}</span>
              <span className="text-[8px] md:text-[9px] text-white/80 font-bold uppercase tracking-widest mt-0.5">Giây</span>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {displayProducts.map(product => (
            <FlashSaleCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  )
}

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Zap, Clock, Flame } from 'lucide-react'
import { useProductFilters } from '../ProductListPage/hooks/useProductFilters'
import ProductGrid from '../ProductListPage/components/ProductGrid'
import ProductListLoadingState from '../ProductListPage/components/ProductListLoadingState'

// Hook đếm ngược thời gian giả lập (đến cuối ngày hôm nay)
function useCountdown() {
  const [timeLeft, setTimeLeft] = useState({ hours: '00', minutes: '00', seconds: '00' })

  useEffect(() => {
    // Đặt mục tiêu là 23:59:59 ngày hôm nay
    const target = new Date()
    target.setHours(23, 59, 59, 999)

    const timer = setInterval(() => {
      const now = new Date()
      const diff = target - now

      if (diff <= 0) {
        clearInterval(timer)
        return
      }

      const h = Math.floor((diff / (1000 * 60 * 60)) % 24).toString().padStart(2, '0')
      const m = Math.floor((diff / 1000 / 60) % 60).toString().padStart(2, '0')
      const s = Math.floor((diff / 1000) % 60).toString().padStart(2, '0')

      setTimeLeft({ hours: h, minutes: m, seconds: s })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  return timeLeft
}

export default function FlashSalePage() {
  const { products, loading, error, updateFilters } = useProductFilters()
  const { hours, minutes, seconds } = useCountdown()

  // Tạm thời fetch tất cả sản phẩm và sắp xếp theo 'newest' hoặc 'price-asc' để làm list Flash Sale
  useEffect(() => {
    updateFilters({ sortBy: 'newest' })
  }, [updateFilters])

  return (
    <div className="mx-4.5 py-6 pb-16">
      {/* Breadcrumb */}
      <nav className="mb-4 flex items-center gap-1.5 text-sm">
        <Link to="/" className="text-slate-500 hover:text-blue-600 font-medium">Trang chủ</Link>
        <ChevronRight size={13} className="text-slate-300" />
        <span className="text-red-600 font-bold">Flash Sale</span>
      </nav>

      {/* ── FLASH SALE BANNER ── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-red-600 via-orange-500 to-amber-500 shadow-lg shadow-red-500/20 mb-8">
        {/* Background effects */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-amber-300/20 rounded-full blur-3xl"></div>

        <div className="relative px-6 py-10 md:py-14 flex flex-col md:flex-row items-center justify-between gap-8 text-white">
          
          <div className="flex flex-col items-center md:items-start text-center md:text-left gap-2">
            <div className="flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full border border-white/30 w-fit mb-2">
              <Flame size={16} className="text-yellow-300 fill-yellow-300 animate-pulse" />
              <span className="text-xs font-black uppercase tracking-wider text-yellow-50">Sự kiện giới hạn</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight flex items-center gap-3">
              <Zap className="text-yellow-300 fill-yellow-300" size={48} />
              Flash Sale
            </h1>
            <p className="text-red-50 text-base md:text-lg font-medium opacity-90 max-w-md">
              Săn ngay deal hot giảm giá lên đến 50%. Số lượng và thời gian có hạn, chớp ngay cơ hội!
            </p>
          </div>

          <div className="flex flex-col items-center gap-3 bg-black/20 backdrop-blur-md p-6 rounded-2xl border border-white/10 shrink-0">
            <div className="flex items-center gap-2 text-yellow-300 mb-1">
              <Clock size={20} />
              <span className="font-bold text-sm uppercase tracking-wide">Kết thúc sau</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-center">
                <span className="w-14 h-16 flex items-center justify-center bg-white text-red-600 text-3xl font-black rounded-xl shadow-inner">{hours}</span>
                <span className="text-[10px] font-bold mt-2 uppercase opacity-80">Giờ</span>
              </div>
              <span className="text-2xl font-black animate-pulse pb-5">:</span>
              <div className="flex flex-col items-center">
                <span className="w-14 h-16 flex items-center justify-center bg-white text-red-600 text-3xl font-black rounded-xl shadow-inner">{minutes}</span>
                <span className="text-[10px] font-bold mt-2 uppercase opacity-80">Phút</span>
              </div>
              <span className="text-2xl font-black animate-pulse pb-5">:</span>
              <div className="flex flex-col items-center">
                <span className="w-14 h-16 flex items-center justify-center bg-white text-red-600 text-3xl font-black rounded-xl shadow-inner">{seconds}</span>
                <span className="text-[10px] font-bold mt-2 uppercase opacity-80">Giây</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── PRODUCT LIST ── */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <h2 className="text-xl font-black text-slate-900 uppercase">Đang mở bán</h2>
          <span className="text-sm font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">{products.length} sản phẩm</span>
        </div>

        {loading && <ProductListLoadingState />}
        
        {error && (
          <div className="text-center py-10 bg-red-50 text-red-600 rounded-xl border border-red-200">
            {error}
          </div>
        )}

        {!loading && !error && products.length > 0 && (
          <ProductGrid
            products={products}
            loading={loading}
            onAddToCart={() => {}}
            onAddToWishlist={() => {}}
          />
        )}
      </div>
    </div>
  )
}

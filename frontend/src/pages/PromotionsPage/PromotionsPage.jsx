import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Copy, Check, Clock, Tag, Gift, Zap, Sparkles } from 'lucide-react'

// Mock Data
const promotions = [
  {
    id: 1,
    type: 'voucher',
    title: 'Mã Giảm Giá SAVE10 - Ưu Đãi 10%',
    desc: 'Nhập mã SAVE10 để giảm ngay 10% tổng giá trị đơn hàng (mức giảm tối đa lên tới 1 triệu đồng).',
    badge: 'Mã Giảm Giá',
    date: 'Đến 31/12/2026',
    image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&q=80&w=1000',
    code: 'SAVE10'
  },
  {
    id: 2,
    type: 'voucher',
    title: 'Voucher WELCOME50 - Quà Tặng Bạn Mới',
    desc: 'Giảm ngay 50.000đ cho mọi đơn hàng có giá trị từ 200.000đ trở lên khi nhập mã tại bước thanh toán.',
    badge: 'Mã Giảm Giá',
    date: 'Đến 31/12/2026',
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80&w=1000',
    code: 'WELCOME50'
  },
  {
    id: 3,
    type: 'laptop',
    title: 'Back To School - Ưu Đãi Sinh Viên BTS2026',
    desc: 'Giảm thêm 5% cho Học sinh - Sinh viên khi mua Laptop. Tặng kèm Balo chống sốc.',
    badge: 'Hot Deal',
    date: 'Đến 30/09/2026',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=1000',
    code: 'BTS2026'
  },
  {
    id: 4,
    type: 'voucher',
    title: 'Voucher NEW500K - Trợ Giá Laptop Khủng',
    desc: 'Nhập mã để nhận ngay ưu đãi giảm trực tiếp 500.000đ cho đơn hàng từ 10 triệu.',
    badge: 'Mã Giảm Giá',
    date: 'Đến 31/12/2026',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1000',
    code: 'NEW500K'
  },
  {
    id: 5,
    type: 'voucher',
    title: 'Freeship Toàn Quốc FREESHIPXTRA',
    desc: 'Giảm ngay 30.000đ phí vận chuyển cho mọi đơn hàng từ 1.000.000đ.',
    badge: 'Vận Chuyển',
    date: 'Không giới hạn',
    image: 'https://images.unsplash.com/photo-1580674285054-bed31e145f59?auto=format&fit=crop&q=80&w=1000',
    code: 'FREESHIPXTRA'
  },
  {
    id: 6,
    type: 'accessory',
    title: 'Sale Phụ Kiện - Mua 1 Tặng 1',
    desc: 'Áp dụng cho toàn bộ Chuột, Bàn phím cơ và Tai nghe. Mua 1 sản phẩm tặng 1 lót chuột.',
    badge: 'Flash Sale',
    date: 'Chỉ trong hôm nay',
    image: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&q=80&w=1000',
  }
]

export default function PromotionsPage() {
  const [activeTab, setActiveTab] = useState('all')
  const [copiedCode, setCopiedCode] = useState(null)

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const filteredPromos = activeTab === 'all' 
    ? promotions 
    : promotions.filter(p => p.type === activeTab)

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="mx-4.5 py-6 pb-16">
        
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-1.5 text-sm">
          <Link to="/" className="text-slate-500 hover:text-blue-600 transition-colors font-medium">Trang chủ</Link>
          <ChevronRight size={14} className="text-slate-300" />
          <span className="text-slate-900 font-semibold">Khuyến mãi</span>
        </nav>

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Khuyến mãi & Ưu đãi</h1>
              <span className="px-2.5 py-1 text-[10px] font-bold bg-blue-100 text-blue-700 rounded-full uppercase tracking-wider flex items-center gap-1">
                <Sparkles size={12} /> Hot
              </span>
            </div>
            <p className="text-slate-500 text-sm max-w-2xl">Hàng ngàn mã giảm giá và quà tặng hấp dẫn đang chờ bạn. Đừng bỏ lỡ cơ hội sở hữu laptop mơ ước với giá cực hời!</p>
          </div>
        </div>

        {/* Highlighted Banner */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-1 mb-8 overflow-hidden relative">
          <div className="absolute inset-0 bg-blue-600/5 z-0"></div>
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 p-6 md:p-8">
             <div className="flex-1">
               <h2 className="text-2xl font-black text-slate-900 mb-2">Back To School - Deal Sinh Viên Khủng</h2>
               <p className="text-slate-600 mb-4">Giảm thêm đến 10% cho Học sinh - Sinh viên khi mua Laptop, PC. Tặng kèm Balo chống sốc cao cấp.</p>
               <button className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition-colors shadow-[0_4px_14px_0_rgb(37,99,235,0.39)]">
                 Khám phá ngay
               </button>
             </div>
             <div className="w-full md:w-1/3 aspect-video md:aspect-auto md:h-40 rounded-xl overflow-hidden shrink-0 shadow-sm border border-slate-100">
               <img src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=1000" className="w-full h-full object-cover" alt="Banner" />
             </div>
          </div>
        </div>
        
        {/* Filter Tabs */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-2 md:p-3 flex flex-wrap gap-2 items-center justify-center md:justify-start overflow-x-auto no-scrollbar mb-10">
          {[
            { id: 'all', label: 'Tất Cả Ưu Đãi', icon: Gift },
            { id: 'laptop', label: 'Khuyến Mãi Laptop', icon: Tag },
            { id: 'accessory', label: 'Phụ Kiện Giảm Giá', icon: Tag },
            { id: 'voucher', label: 'Mã Giảm Giá', icon: Tag }
          ].map(tab => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' 
                    : 'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <tab.icon size={16} /> {tab.label}
              </button>
            )
          })}
        </div>

        {/* Promo Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {filteredPromos.map(promo => (
            <div key={promo.id} className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col">
              
              {/* Image Container */}
              <div className="relative h-56 overflow-hidden">
                <img 
                  src={promo.image} 
                  alt={promo.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 bg-red-600 text-white text-xs font-black uppercase tracking-wider rounded-lg shadow-lg">
                    {promo.badge}
                  </span>
                </div>
                <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-slate-900/60 to-transparent"></div>
              </div>

              {/* Content */}
              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-center gap-1.5 text-blue-600 text-xs font-bold mb-3">
                  <Clock size={14} /> <span>{promo.date}</span>
                </div>
                
                <h3 className="text-xl font-black text-slate-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                  {promo.title}
                </h3>
                
                <p className="text-sm text-slate-500 line-clamp-3 mb-6 flex-1">
                  {promo.desc}
                </p>

                {/* Actions */}
                {promo.code ? (
                  <div className="mt-auto">
                    <p className="text-xs font-bold text-slate-400 uppercase mb-2">Mã Khuyến Mãi</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 border-2 border-dashed border-blue-200 bg-blue-50 text-blue-700 font-mono font-black text-lg py-2 px-4 rounded-xl text-center select-all">
                        {promo.code}
                      </div>
                      <button 
                        onClick={() => handleCopy(promo.code)}
                        className={`p-3 rounded-xl transition-colors shrink-0 flex items-center justify-center ${
                          copiedCode === promo.code 
                            ? 'bg-green-500 text-white shadow-lg shadow-green-500/30' 
                            : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/30'
                        }`}
                        title="Copy mã"
                      >
                        {copiedCode === promo.code ? <Check size={20} /> : <Copy size={20} />}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-auto pt-4 border-t border-slate-100">
                    <Link to="/products" className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition-colors">
                      Xem Chi Tiết <ChevronRight size={18} />
                    </Link>
                  </div>
                )}
              </div>

            </div>
          ))}
        </div>

        {filteredPromos.length === 0 && (
          <div className="py-20 text-center">
            <Gift size={64} className="mx-auto text-slate-200 mb-4" />
            <h3 className="text-xl font-bold text-slate-700 mb-2">Không tìm thấy khuyến mãi nào</h3>
            <p className="text-slate-500">Hiện tại chưa có chương trình khuyến mãi cho danh mục này.</p>
          </div>
        )}

      </div>
    </div>
  )
}

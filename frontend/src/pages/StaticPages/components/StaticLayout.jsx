import { Link, useLocation } from 'react-router-dom'
import { ChevronRight, Info, Shield, Truck, RefreshCcw, Lock, HelpCircle, CreditCard, Phone, Mail, MessageSquare, Zap } from 'lucide-react'

const MENU = [
  { path: '/guide', label: 'Hướng dẫn mua hàng', icon: HelpCircle },
  { path: '/payment-guide', label: 'Hướng dẫn thanh toán', icon: CreditCard },
  { path: '/shipping-policy', label: 'Chính sách giao hàng', icon: Truck },
  { path: '/return-policy', label: 'Chính sách đổi trả', icon: RefreshCcw },
  { path: '/warranty-policy', label: 'Chính sách bảo hành', icon: Shield },
  { path: '/faqs', label: 'Câu hỏi thường gặp', icon: HelpCircle },
]

export default function StaticLayout({ title, children }) {
  const { pathname } = useLocation()

  return (
    <div className="mx-4.5 py-6 pb-16">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-1.5 text-sm flex-wrap">
        <Link to="/" className="text-slate-500 hover:text-blue-600 font-medium">Trang chủ</Link>
        <ChevronRight size={13} className="text-slate-300" />
        <span className="text-blue-600 font-semibold">{title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 items-start">
        {/* Sidebar */}
        <div className="space-y-6 lg:sticky lg:top-24">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-black text-slate-900 uppercase tracking-tight text-sm">Trung tâm hỗ trợ</h3>
            </div>
            <div className="p-2 space-y-1">
              {MENU.map(({ path, label, icon: Icon }) => {
                const active = pathname === path
                return (
                  <Link key={path} to={path} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${active ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
                    <Icon size={18} className={active ? 'text-blue-600' : 'text-slate-400'} />
                    <span className="text-sm">{label}</span>
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Need help box */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
            <h4 className="font-black text-slate-900 text-sm uppercase tracking-tight">Cần hỗ trợ thêm?</h4>
            <p className="text-xs text-slate-500 leading-relaxed flex items-center gap-1">
              Đội ngũ TechZone luôn sẵn sàng hỗ trợ bạn 24/7
              <Zap size={13} className="text-amber-500 fill-amber-500 shrink-0" />
            </p>
            
            <div className="space-y-3.5">
              <div className="flex items-start gap-3">
                <Phone size={16} className="text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-slate-800">Hotline: 1900 1234</p>
                  <p className="text-[10px] text-slate-500">(8:00 - 21:00 tất cả các ngày)</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail size={16} className="text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-slate-800">Email: support@techzone.vn</p>
                  <p className="text-[10px] text-slate-500">Phản hồi trong 30 phút</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MessageSquare size={16} className="text-blue-600 shrink-0 mt-0.5 animate-pulse" />
                <div>
                  <p className="text-xs font-bold text-slate-800">Chat trực tuyến</p>
                  <p className="text-[10px] text-slate-500 font-semibold text-blue-600 cursor-pointer hover:underline">Hỗ trợ nhanh chóng</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 md:px-8 py-5 border-b border-slate-100">
            <h1 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-tight">{title}</h1>
          </div>
          <div className="p-6 md:p-8 space-y-6 text-sm md:text-base text-slate-700 leading-relaxed">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

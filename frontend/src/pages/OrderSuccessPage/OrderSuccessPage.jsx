import { Link, useLocation, useNavigate } from 'react-router-dom'
import { CheckCircle2, Package, Truck, MapPin, CreditCard, ChevronRight, Phone, MessageCircle, Mail } from 'lucide-react'

const fmt = (n) => Number(n || 0).toLocaleString('vi-VN') + '₫'

const PAYMENT_LABELS = {
  cod: 'Thanh toán khi nhận hàng (COD)',
  bank: 'Chuyển khoản ngân hàng',
  atm: 'Thẻ ATM / Internet Banking',
  card: 'Thẻ tín dụng / Thẻ ghi nợ',
  ewallet: 'Ví điện tử',
}

function OrderSuccessPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const state = location.state || {}
  const { form = {}, payment = 'cod', cart = { items: [], subtotal: 0, shipping_cost: 0 }, discount = 0, orderId = 'LD00000000' } = state

  const shipping = cart.shipping_cost || 0
  const total = (cart.subtotal || 0) + shipping - discount

  return (
    <div className="mx-4.5 py-6 pb-16">
      {/* Breadcrumb */}
      <nav className="mb-5 flex items-center gap-1.5 text-sm">
        <Link to="/" className="text-slate-500 hover:text-blue-600 font-medium">Trang chủ</Link>
        <ChevronRight size={13} className="text-slate-300" />
        <span className="text-blue-600 font-semibold">Đặt hàng thành công</span>
      </nav>

      {/* Success hero */}
      <div className="bg-white rounded-2xl border border-green-200 shadow-sm p-8 mb-5 flex flex-col items-center text-center">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-4 animate-bounce">
          <CheckCircle2 size={44} className="text-green-500" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 mb-1">Đặt hàng thành công! 🎉</h1>
        <p className="text-slate-500 text-sm mb-4">Cảm ơn bạn đã mua hàng. Chúng tôi sẽ liên hệ xác nhận trong thời gian sớm nhất.</p>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 border border-blue-200">
          <Package size={16} className="text-blue-600" />
          <span className="text-sm font-black text-blue-700">Mã đơn hàng: #{orderId}</span>
        </div>
        <div className="flex gap-3 mt-6 flex-wrap justify-center">
          <button onClick={() => navigate(`/order-tracking/${orderId}`, { state })}
            className="px-5 h-10 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-all flex items-center gap-2">
            <Truck size={15} /> Theo dõi đơn hàng
          </button>
          <Link to="/products" className="px-5 h-10 rounded-xl border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-all flex items-center gap-2">
            Tiếp tục mua sắm
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Order info */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/60">
            <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Thông tin đơn hàng</span>
          </div>
          <div className="p-5 space-y-3">
            {[
              { icon: Package, label: 'Mã đơn hàng', val: `#${orderId}` },
              { icon: CreditCard, label: 'Phương thức thanh toán', val: PAYMENT_LABELS[payment] || payment },
              { icon: Truck, label: 'Phương thức vận chuyển', val: form.shipping === 'express' ? 'Giao hàng nhanh (1-2 ngày)' : 'Giao hàng tiêu chuẩn (2-3 ngày)' },
            ].map(({ icon: Icon, label, val }) => (
              <div key={label} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
                  <Icon size={14} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">{label}</p>
                  <p className="text-sm font-semibold text-slate-900">{val}</p>
                </div>
              </div>
            ))}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
                <MapPin size={14} className="text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Địa chỉ giao hàng</p>
                <p className="text-sm font-semibold text-slate-900">{form.full_name}</p>
                <p className="text-xs text-slate-500">{form.phone}</p>
                <p className="text-xs text-slate-500">{form.address}, {form.ward}, {form.district}, {form.province}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Order total */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/60">
            <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Tóm tắt đơn hàng</span>
          </div>
          <div className="p-5 space-y-2.5">
            <div className="flex justify-between text-sm text-slate-600">
              <span>Tạm tính</span><span>{fmt(cart.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-slate-600">
              <span>Phí giao hàng</span>
              <span className={shipping === 0 ? 'text-green-600 font-semibold' : ''}>{shipping === 0 ? 'Miễn phí' : fmt(shipping)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Giảm giá</span><span>-{fmt(discount)}</span>
              </div>
            )}
            <div className="flex justify-between pt-3 border-t border-slate-100">
              <span className="font-black text-slate-900">Tổng thanh toán</span>
              <div className="text-right">
                <p className="font-black text-blue-600 text-xl">{fmt(total)}</p>
                <p className="text-[10px] text-slate-400">(Đã bao gồm VAT)</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Help */}
      <div className="mt-5 bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <p className="text-sm font-semibold text-slate-600 mb-4">Cần hỗ trợ? Đội ngũ LaptopDevice luôn sẵn sàng hỗ trợ bạn 24/7</p>
        <div className="flex gap-4 flex-wrap">
          {[
            { icon: Phone, label: 'Gọi ngay 1900 1234', cls: 'bg-green-50 border-green-200 text-green-700' },
            { icon: MessageCircle, label: 'Chat với chúng tôi', cls: 'bg-blue-50 border-blue-200 text-blue-700' },
            { icon: Mail, label: 'Gửi email hỗ trợ', cls: 'bg-slate-50 border-slate-200 text-slate-700' },
          ].map(({ icon: Icon, label, cls }) => (
            <button key={label} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all hover:opacity-80 ${cls}`}>
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default OrderSuccessPage

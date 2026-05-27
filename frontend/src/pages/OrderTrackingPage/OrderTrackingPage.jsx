import { Link, useLocation, useParams } from 'react-router-dom'
import { ChevronRight, Package, Truck, MapPin, CreditCard, Phone, MessageCircle, Mail, Copy, Check } from 'lucide-react'
import { useState } from 'react'

const fmt = (n) => Number(n || 0).toLocaleString('vi-VN') + '₫'

const PAYMENT_LABELS = {
  cod: 'Thanh toán khi nhận hàng (COD)',
  bank: 'Chuyển khoản ngân hàng',
  atm: 'Thẻ ATM / Internet Banking',
  card: 'Thẻ tín dụng / Thẻ ghi nợ',
  ewallet: 'Ví điện tử',
}

const ORDER_STEPS = [
  { label: 'Đặt hàng thành công', sub: 'Đơn hàng của bạn đã được tiếp nhận', time: '20/05/2026 - 10:30', done: true },
  { label: 'Xác nhận đơn hàng', sub: 'Đơn hàng đã được xác nhận và đang được chuẩn bị', time: '20/05/2026 - 10:35', done: true },
  { label: 'Đóng gói sản phẩm', sub: 'Sản phẩm đang được đóng gói và kiểm tra chất lượng', time: '20/05/2026 - 14:20', done: true },
  { label: 'Bàn giao cho đơn vị vận chuyển', sub: 'Đơn hàng đã được bàn giao cho đơn vị vận chuyển', time: '21/05/2026 - 09:15', done: true },
  { label: 'Đang vận chuyển', sub: 'Đơn hàng đang được giao đến bạn', time: '21/05/2026 - 10:30', done: false, active: true },
  { label: 'Giao hàng thành công', sub: 'Cảm ơn bạn đã mua sắm tại LaptopDevice', time: '', done: false },
]

/* ─── OrderTrackingPage ──────────────────────────────────────── */
function OrderTrackingPage() {
  const { id } = useParams()
  const location = useLocation()
  const state = location.state || {}
  const { form = {}, payment = 'cod', cart = { items: [], subtotal: 0, shipping_cost: 0 }, discount = 0 } = state

  const orderId = id || 'LD00000000'
  const shipping = cart.shipping_cost || 0
  const total = (cart.subtotal || 0) + shipping - discount

  const [copied, setCopied] = useState(false)
  const copyTracking = () => {
    navigator.clipboard.writeText('GHN1234567890')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="mx-4.5 py-6 pb-16">
      {/* Breadcrumb */}
      <nav className="mb-5 flex items-center gap-1.5 text-sm flex-wrap">
        <Link to="/" className="text-slate-500 hover:text-blue-600 font-medium">Trang chủ</Link>
        <ChevronRight size={13} className="text-slate-300" />
        <Link to="/profile" className="text-slate-500 hover:text-blue-600 font-medium">Tài khoản</Link>
        <ChevronRight size={13} className="text-slate-300" />
        <span className="text-blue-600 font-semibold">Theo dõi đơn hàng</span>
      </nav>

      <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-6">Theo dõi đơn hàng</h1>

      {/* ── Top grid: Order card + Timeline ─────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-5 mb-5">

        {/* Order info card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 flex items-center gap-3 border-b border-slate-100">
            <span className="font-black text-slate-900 text-sm">ĐƠN HÀNG #{orderId}</span>
            <span className="px-2.5 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-bold border border-green-200">Đã xác nhận</span>
          </div>
          <div className="p-5 space-y-3.5">
            {[
              { label: 'Ngày đặt hàng', val: '20/05/2026 - 10:30' },
              { label: 'Phương thức thanh toán', val: PAYMENT_LABELS[payment] || 'COD' },
              { label: 'Phương thức vận chuyển', val: form.shipping === 'express' ? 'Giao hàng nhanh' : 'Giao hàng tiêu chuẩn' },
            ].map(({ label, val }) => (
              <div key={label}>
                <p className="text-xs text-slate-500">{label}</p>
                <p className="text-sm font-semibold text-slate-900 mt-0.5">{val}</p>
              </div>
            ))}
            <div>
              <p className="text-xs text-slate-500">Mã vận đơn</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-sm font-semibold text-slate-900">GHN1234567890</span>
                <button onClick={copyTracking} className="flex items-center gap-1 text-xs text-blue-600 hover:underline font-medium">
                  {copied ? <Check size={12} /> : <Copy size={12} />} {copied ? 'Đã sao chép' : 'Sao chép'}
                </button>
              </div>
            </div>
            <div className="pt-2 border-t border-slate-100">
              <p className="text-xs text-slate-500">Tổng thanh toán</p>
              <p className="text-2xl font-black text-blue-600 mt-0.5">{fmt(total)}</p>
              <p className="text-xs text-slate-400">(Đã bao gồm VAT)</p>
            </div>
          </div>
          <div className="px-5 pb-5">
            <button className="w-full h-10 rounded-xl border border-blue-200 text-blue-600 text-sm font-bold hover:bg-blue-50 transition-all flex items-center justify-center gap-2">
              <Package size={14} /> Mua lại đơn hàng
            </button>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <span className="font-black text-slate-900 text-sm uppercase tracking-tight">Trạng thái đơn hàng</span>
          </div>
          <div className="p-5">
            <div className="relative">
              {/* vertical line */}
              <div className="absolute left-[17px] top-0 bottom-0 w-0.5 bg-slate-100" />
              <div className="space-y-0">
                {ORDER_STEPS.map((s, i) => (
                  <div key={i} className="relative flex gap-4 pb-5 last:pb-0">
                    {/* Dot */}
                    <div className={`relative z-10 w-9 h-9 rounded-full flex items-center justify-center shrink-0 border-2 ${
                      s.done   ? 'bg-blue-600 border-blue-600' :
                      s.active ? 'bg-white border-blue-600 ring-4 ring-blue-100' :
                                 'bg-white border-slate-200'
                    }`}>
                      {s.done ? (
                        <Check size={14} className="text-white" />
                      ) : (
                        <span className={`text-xs font-black ${s.active ? 'text-blue-600' : 'text-slate-400'}`}>{i + 1}</span>
                      )}
                    </div>
                    {/* Content */}
                    <div className="flex-1 pt-1.5 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm font-bold leading-tight ${s.active ? 'text-blue-600' : s.done ? 'text-slate-900' : 'text-slate-400'}`}>
                          {s.label}
                        </p>
                        {s.time && <span className={`text-[11px] font-medium whitespace-nowrap shrink-0 ${s.active ? 'text-blue-500' : 'text-slate-400'}`}>{s.time}</span>}
                      </div>
                      {s.sub && <p className={`text-xs mt-0.5 leading-relaxed ${s.done || s.active ? 'text-slate-500' : 'text-slate-300'}`}>{s.sub}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Delivery estimate banner ─────────────────────────── */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-5 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shrink-0">
            <Truck size={18} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-black text-blue-900">Dự kiến giao hàng: <span className="text-blue-600">Thứ Năm, 23/05/2026 (Từ 8:00 – 18:00)</span></p>
            <p className="text-xs text-blue-700 mt-0.5">Đơn hàng của bạn đang trên đường giao đến địa chỉ nhận hàng.</p>
          </div>
        </div>
        <button className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-all shrink-0">
          Liên hệ shipper
        </button>
      </div>

      {/* ── Product table ─────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-5">
        <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/60">
          <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Chi tiết sản phẩm</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Sản phẩm</th>
                <th className="text-right px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Đơn giá</th>
                <th className="text-center px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Số lượng</th>
                <th className="text-right px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Thành tiền</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(cart.items || []).map((item, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0">
                        {item.image
                          ? <img src={`http://localhost:8000${item.image}`} alt={item.name} className="w-full h-full object-contain p-1" />
                          : <Package size={18} className="text-slate-300" />}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 text-sm">{item.name}</p>
                        <p className="text-xs text-slate-400 mt-0.5">Bảo hành: 24 tháng</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-right font-semibold text-slate-700">{fmt(item.price)}</td>
                  <td className="px-5 py-4 text-center font-semibold text-slate-700">{item.quantity}</td>
                  <td className="px-5 py-4 text-right font-black text-blue-600">{fmt((item.price || 0) * (item.quantity || 1))}</td>
                </tr>
              ))}
              {!(cart.items || []).length && (
                <tr><td colSpan={4} className="px-5 py-8 text-center text-slate-400 text-sm">Không có dữ liệu sản phẩm</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Bottom: Shipping info + Order summary ─────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        {/* Shipping info */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/60">
            <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Thông tin giao hàng</span>
          </div>
          <div className="p-5 space-y-2">
            {[
              { label: 'Người nhận', val: form.full_name || 'Nguyễn Văn A' },
              { label: 'Số điện thoại', val: form.phone || '0901234567' },
              { label: 'Địa chỉ', val: form.address ? `${form.address}, ${form.ward}, ${form.district}, ${form.province}` : '123 Đường ABC, Phường 1, Quận 1, TP.HCM' },
            ].map(({ label, val }) => (
              <div key={label} className="flex gap-3">
                <span className="text-xs text-slate-400 w-28 shrink-0 pt-0.5">{label}</span>
                <span className="text-sm font-semibold text-slate-900">{val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Order summary */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/60">
            <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Thông tin đơn hàng</span>
          </div>
          <div className="p-5 space-y-2.5">
            {[
              { label: 'Mã đơn hàng', val: `#${orderId}` },
              { label: 'Ghi chú', val: form.note || 'Không' },
              { label: 'Giảm giá', val: discount > 0 ? `-${fmt(discount)}` : 'Không' },
              { label: 'Tạm tính', val: fmt(cart.subtotal) },
              { label: 'Phí giao hàng', val: shipping === 0 ? 'Miễn phí' : fmt(shipping) },
            ].map(({ label, val }) => (
              <div key={label} className="flex justify-between text-sm">
                <span className="text-slate-500">{label}</span>
                <span className="font-semibold text-slate-900">{val}</span>
              </div>
            ))}
            <div className="flex justify-between pt-3 border-t border-slate-200">
              <span className="font-black text-slate-900">Tổng thanh toán</span>
              <div className="text-right">
                <p className="text-xl font-black text-blue-600">{fmt(total)}</p>
                <p className="text-[10px] text-slate-400">(Đã bao gồm VAT)</p>
              </div>
            </div>
            <button className="w-full mt-2 h-9 rounded-xl border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
              🖨 Xem hoá đơn
            </button>
          </div>
        </div>
      </div>

      {/* Help strip */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <p className="font-bold text-slate-800 text-sm">Cần hỗ trợ?</p>
          <p className="text-xs text-slate-500">Đội ngũ LaptopDevice luôn sẵn sàng hỗ trợ bạn 24/7</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          {[
            { icon: Phone, label: 'Gọi ngay 1900 1234', cls: 'bg-green-50 border-green-200 text-green-700' },
            { icon: MessageCircle, label: 'Chat với chúng tôi', cls: 'bg-blue-50 border-blue-200 text-blue-700' },
            { icon: Mail, label: 'Gửi email hỗ trợ', cls: 'bg-slate-50 border-slate-200 text-slate-700' },
          ].map(({ icon: Icon, label, cls }) => (
            <button key={label} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold hover:opacity-80 transition-all ${cls}`}>
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default OrderTrackingPage

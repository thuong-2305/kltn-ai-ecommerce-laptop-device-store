import { Link, useParams } from 'react-router-dom'
import { ChevronRight, Package, Truck, MapPin, CreditCard, Phone, MessageCircle, Mail, Copy, Check, RefreshCw } from 'lucide-react'
import { useState, useEffect } from 'react'
import axios from 'axios'

const fmt = (n) => Number(n || 0).toLocaleString('vi-VN') + '₫'

const getOrderSteps = (status, dateOrdered, dateShipped) => {
  const formattedOrderTime = dateOrdered ? new Date(dateOrdered).toLocaleString('vi-VN') : ''
  const formattedShipTime = dateShipped ? new Date(dateShipped).toLocaleString('vi-VN') : ''
  
  if (status === 'cancelled') {
    return [
      { label: 'Đặt hàng thành công', sub: 'Đơn hàng của bạn đã được tiếp nhận', time: formattedOrderTime, done: true },
      { label: 'Đã hủy đơn', sub: 'Đơn hàng đã bị hủy', time: '', done: true, active: false, error: true },
      { label: 'Đang vận chuyển', sub: 'Đơn hàng đang được giao đến bạn', time: '', done: false },
      { label: 'Giao hàng thành công', sub: 'Cảm ơn bạn đã mua sắm tại LaptopDevice', time: '', done: false },
    ]
  }

  return [
    { label: 'Đặt hàng thành công', sub: 'Đơn hàng của bạn đã được tiếp nhận', time: formattedOrderTime, done: true },
    { 
      label: 'Xác nhận đơn hàng', 
      sub: 'Đơn hàng đã được xác nhận và đang được chuẩn bị', 
      time: '', 
      done: ['confirmed', 'shipping', 'delivered'].includes(status), 
      active: status === 'pending' 
    },
    { 
      label: 'Đang vận chuyển', 
      sub: 'Đơn hàng đang được giao đến bạn', 
      time: formattedShipTime, 
      done: status === 'delivered', 
      active: status === 'shipping' 
    },
    { 
      label: 'Giao hàng thành công', 
      sub: 'Cảm ơn bạn đã mua sắm tại LaptopDevice', 
      time: formattedShipTime, 
      done: status === 'delivered', 
      active: false 
    },
  ]
}

function OrderTrackingPage() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const fetchOrderDetail = async () => {
      setLoading(true)
      setError(null)
      try {
        const token = localStorage.getItem('ld_access')
        const headers = token ? { Authorization: `Bearer ${token}` } : {}
        const res = await axios.get(`http://localhost:8000/api/payment/orders/${id}/detail/`, { headers })
        setOrder(res.data)
      } catch (err) {
        console.error('Error fetching order detail:', err)
        setError('Không thể tải thông tin đơn hàng.')
      } finally {
        setLoading(false)
      }
    }
    fetchOrderDetail()
  }, [id])

  const copyTracking = () => {
    navigator.clipboard.writeText('GHN1234567890')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center py-20 gap-3">
        <RefreshCw size={24} className="text-blue-650 animate-spin" />
        <p className="text-slate-500 font-semibold text-sm">Đang tải thông tin hành trình đơn hàng...</p>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="mx-4.5 py-10 text-center">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 text-red-700 font-bold max-w-md mx-auto">
          {error || 'Không tìm thấy thông tin đơn hàng.'}
        </div>
        <Link to="/profile?tab=orders" className="inline-block mt-4 text-blue-600 font-bold hover:underline">
          Quay lại danh sách đơn hàng
        </Link>
      </div>
    )
  }

  const subtotal = order.items ? order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0) : 0
  const shipping = Math.max(0, order.amount_paid - subtotal)
  const steps = getOrderSteps(order.status, order.date_ordered, order.date_shipped)
  const statusCfg = {
    pending:   { label: 'Chờ xử lý', cls: 'bg-amber-100 text-amber-700 border-amber-200' },
    confirmed: { label: 'Đã xác nhận', cls: 'bg-blue-100 text-blue-700 border-blue-200' },
    shipping:  { label: 'Đang giao hàng', cls: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
    delivered: { label: 'Đã giao hàng', cls: 'bg-green-100 text-green-700 border-green-200' },
    cancelled: { label: 'Đã hủy', cls: 'bg-slate-200 text-slate-700 border-slate-300' },
  }
  const cfg = statusCfg[order.status] || { label: order.status, cls: 'bg-slate-100 text-slate-700 border-slate-200' }

  return (
    <div className="mx-4.5 py-6 pb-16">
      {/* Breadcrumb */}
      <nav className="mb-5 flex items-center gap-1.5 text-sm flex-wrap">
        <Link to="/" className="text-slate-500 hover:text-blue-600 font-medium">Trang chủ</Link>
        <ChevronRight size={13} className="text-slate-300" />
        <Link to="/profile?tab=orders" className="text-slate-500 hover:text-blue-600 font-medium">Đơn hàng của tôi</Link>
        <ChevronRight size={13} className="text-slate-300" />
        <span className="text-blue-600 font-semibold">Theo dõi đơn hàng</span>
      </nav>

      <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-6">Theo dõi đơn hàng</h1>

      {/* ── Top grid: Order card + Timeline ─────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-5 mb-5">

        {/* Order info card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 flex items-center gap-3 border-b border-slate-100">
            <span className="font-black text-slate-900 text-sm">ĐƠN HÀNG #{order.order_code || order.id}</span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${cfg.cls}`}>{cfg.label}</span>
          </div>
          <div className="p-5 space-y-3.5">
            {[
              { 
                label: 'Ngày đặt hàng', 
                val: order.date_ordered ? new Date(order.date_ordered).toLocaleString('vi-VN') : 'N/A' 
              },
              { 
                label: 'Phương thức thanh toán', 
                val: order.is_paid ? 'Thanh toán trực tuyến (Đã thanh toán)' : 'Thanh toán khi nhận hàng (COD)' 
              },
              { 
                label: 'Trạng thái vận chuyển', 
                val: order.status === 'delivered' ? 'Giao hàng thành công' : order.status === 'shipping' ? 'Đang giao hàng' : 'Chờ bàn giao vận chuyển' 
              },
            ].map(({ label, val }) => (
              <div key={label}>
                <p className="text-xs text-slate-500">{label}</p>
                <p className="text-sm font-semibold text-slate-900 mt-0.5">{val}</p>
              </div>
            ))}
            {order.status !== 'cancelled' && (
              <div>
                <p className="text-xs text-slate-500">Mã vận đơn</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-sm font-semibold text-slate-900">GHN1234567890</span>
                  <button onClick={copyTracking} className="flex items-center gap-1 text-xs text-blue-600 hover:underline font-medium">
                    {copied ? <Check size={12} /> : <Copy size={12} />} {copied ? 'Đã sao chép' : 'Sao chép'}
                  </button>
                </div>
              </div>
            )}
            <div className="pt-2 border-t border-slate-100">
              <p className="text-xs text-slate-500">Tổng thanh toán</p>
              <p className="text-2xl font-black text-blue-600 mt-0.5">{fmt(order.amount_paid)}</p>
              <p className="text-xs text-slate-400">(Đã bao gồm VAT)</p>
            </div>
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
                {steps.map((s, i) => (
                  <div key={i} className="relative flex gap-4 pb-5 last:pb-0">
                    {/* Dot */}
                    <div className={`relative z-10 w-9 h-9 rounded-full flex items-center justify-center shrink-0 border-2 ${
                      s.error  ? 'bg-red-500 border-red-500 text-white' :
                      s.done   ? 'bg-blue-600 border-blue-600 text-white' :
                      s.active ? 'bg-white border-blue-600 ring-4 ring-blue-100 text-blue-600' :
                                 'bg-white border-slate-200 text-slate-400'
                    }`}>
                      {s.done ? (
                        <Check size={14} className="text-white" />
                      ) : s.error ? (
                        <span className="text-[10px] font-black">!</span>
                      ) : (
                        <span className="text-xs font-black">{i + 1}</span>
                      )}
                    </div>
                    {/* Content */}
                    <div className="flex-1 pt-1.5 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm font-bold leading-tight ${s.active ? 'text-blue-600' : s.error ? 'text-red-650' : s.done ? 'text-slate-900' : 'text-slate-400'}`}>
                          {s.label}
                        </p>
                        {s.time && <span className={`text-[11px] font-medium whitespace-nowrap shrink-0 ${s.active ? 'text-blue-500' : 'text-slate-400'}`}>{s.time}</span>}
                      </div>
                      {s.sub && <p className={`text-xs mt-0.5 leading-relaxed ${s.done || s.active ? 'text-slate-500' : 'text-slate-305'}`}>{s.sub}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Delivery estimate banner ─────────────────────────── */}
      {order.status !== 'cancelled' && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-5 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shrink-0">
              <Truck size={18} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-black text-blue-900">Trạng thái giao nhận: <span className="text-blue-600">
                {order.status === 'delivered' ? 'Đã giao thành công' : order.status === 'shipping' ? 'Đang trên đường vận chuyển' : 'Đang xử lý chuẩn bị hàng'}
              </span></p>
              <p className="text-xs text-blue-700 mt-0.5">Chúng tôi nỗ lực tối đa để giao hàng trong thời gian sớm nhất.</p>
            </div>
          </div>
        </div>
      )}

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
              {(order.items || []).map((item, i) => {
                const imgUrl = item.product_image 
                  ? (item.product_image.startsWith('http') ? item.product_image : `http://localhost:8000${item.product_image}`)
                  : null
                return (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0">
                          {imgUrl ? (
                            <img src={imgUrl} alt={item.product_name} className="w-full h-full object-contain p-1" />
                          ) : (
                            <Package size={18} className="text-slate-300" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 text-sm">{item.product_name}</p>
                          {item.variant_name && (
                            <p className="text-xs text-slate-400 mt-0.5">Phiên bản: {item.variant_name}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right font-semibold text-slate-700">{fmt(item.price)}</td>
                    <td className="px-5 py-4 text-center font-semibold text-slate-700">{item.quantity}</td>
                    <td className="px-5 py-4 text-right font-black text-blue-600">{fmt(item.price * item.quantity)}</td>
                  </tr>
                )
              })}
              {!(order.items || []).length && (
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
              { label: 'Người nhận', val: order.full_name || 'N/A' },
              { label: 'Số điện thoại', val: order.phone || 'N/A' },
              { label: 'Địa chỉ', val: order.shipping_address || 'N/A' },
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
            <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Thông tin thanh toán</span>
          </div>
          <div className="p-5 space-y-2.5">
            <div className="flex justify-between text-sm text-slate-600">
              <span>Tạm tính</span><span>{fmt(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-slate-600">
              <span>Phí giao hàng</span>
              <span className={shipping === 0 ? 'text-green-600 font-semibold' : ''}>{shipping === 0 ? 'Miễn phí' : fmt(shipping)}</span>
            </div>
            <div className="flex justify-between pt-3 border-t border-slate-200">
              <span className="font-black text-slate-900">Tổng thanh toán</span>
              <div className="text-right">
                <p className="text-xl font-black text-blue-600">{fmt(order.amount_paid)}</p>
                <p className="text-[10px] text-slate-400">(Đã bao gồm VAT)</p>
              </div>
            </div>
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

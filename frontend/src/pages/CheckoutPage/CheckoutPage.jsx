import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AlertCircle, ChevronRight, ChevronLeft, Check, Truck, CreditCard, MapPin, User, Phone, Mail, Tag, Shield, Package, RefreshCw, Headphones } from 'lucide-react'
import { useCart } from '../../features/cart/hooks/useCart'
import axios from 'axios'

/* ─── Helpers ─────────────────────────────────────────────────── */
const fmt = (n) => Number(n).toLocaleString('vi-VN') + '₫'

const STEPS = [
  { n: 1, label: 'Thông tin giao hàng' },
  { n: 2, label: 'Thanh toán' },
  { n: 3, label: 'Xác nhận đơn hàng' },
  { n: 4, label: 'Hoàn tất' },
]

const PROVINCES = ['TP. Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng', 'Cần Thơ', 'Bình Dương', 'Đồng Nai']
const DISTRICTS = { 'TP. Hồ Chí Minh': ['Quận 1', 'Quận 3', 'Quận 7', 'Bình Thạnh', 'Gò Vấp'], default: ['Quận/Huyện 1', 'Quận/Huyện 2'] }
const WARDS = ['Phường 1', 'Phường 2', 'Phường 3', 'Phường Bến Nghé', 'Phường Bến Thành']

const PAYMENT_METHODS = [
  { id: 'cod',   label: 'Thanh toán khi nhận hàng (COD)', sub: 'Thanh toán bằng tiền mặt khi nhận hàng', icon: '💵' },
  { id: 'bank',  label: 'Chuyển khoản ngân hàng', sub: 'Thanh toán bằng chuyển khoản qua ngân hàng', icon: '🏦' },
  { id: 'atm',   label: 'Thẻ ATM / Internet Banking', sub: 'Thanh toán qua Napas', icon: '💳' },
  { id: 'card',  label: 'Thẻ tín dụng / Thẻ ghi nợ', sub: 'Visa, MasterCard, JCB, Amex', icon: '💳' },
  { id: 'ewallet', label: 'Ví điện tử', sub: 'ZaloPay, VNPay, ShopeePay', icon: '📱' },
]

/* ─── Step indicator ─────────────────────────────────────────── */
function StepBar({ current }) {
  return (
    <div className="flex items-center mb-8">
      {STEPS.map((s, i) => {
        const done = s.n < current
        const active = s.n === current
        return (
          <div key={s.n} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5 shrink-0">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-black border-2 transition-all ${
                done   ? 'bg-blue-600 border-blue-600 text-white' :
                active ? 'bg-blue-600 border-blue-600 text-white ring-4 ring-blue-100' :
                         'bg-white border-slate-300 text-slate-400'
              }`}>
                {done ? <Check size={16} /> : s.n}
              </div>
              <span className={`text-[11px] font-semibold whitespace-nowrap ${active ? 'text-blue-600' : done ? 'text-slate-600' : 'text-slate-400'}`}>
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 mb-5 ${done ? 'bg-blue-600' : 'bg-slate-200'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

/* ─── Order summary sidebar ──────────────────────────────────── */
function OrderSidebar({ cart, promo, setPromo, discount, onApplyPromo }) {
  const shipping = cart.shipping_cost || 0
  const subtotal = cart.subtotal || 0
  const total = subtotal + shipping - discount

  return (
    <div className="space-y-4 lg:sticky lg:top-24">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-black text-slate-900 text-sm uppercase tracking-tight">Thông tin đơn hàng</h3>
          <span className="text-xs text-slate-500 font-medium">{cart.item_count} sản phẩm</span>
        </div>

        {/* Items */}
        <div className="p-4 space-y-3 max-h-64 overflow-y-auto">
          {cart.items.map(item => (
            <div key={item.product_id} className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0">
                {item.image
                  ? <img src={`http://localhost:8000${item.image}`} alt={item.name} className="w-full h-full object-contain p-1" />
                  : <Package size={20} className="text-slate-300" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-800 line-clamp-2 leading-tight">{item.name}</p>
                <p className="text-xs text-blue-600 font-black mt-0.5">{fmt(item.price)}</p>
              </div>
              <span className="text-xs text-slate-500 font-semibold shrink-0">x{item.quantity}</span>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="px-5 py-4 border-t border-slate-100 space-y-2.5">
          <div className="flex justify-between text-sm text-slate-600">
            <span>Tạm tính</span><span className="font-semibold">{fmt(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm text-slate-600">
            <span>Phí giao hàng</span>
            <span className={`font-semibold ${shipping === 0 ? 'text-green-600' : ''}`}>
              {shipping === 0 ? 'Miễn phí' : fmt(shipping)}
            </span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>Giảm giá (mã khuyến mãi)</span>
              <span className="font-semibold">-{fmt(discount)}</span>
            </div>
          )}
          <div className="flex justify-between pt-2.5 border-t border-slate-100">
            <span className="font-black text-slate-900">Tổng thanh toán</span>
            <div className="text-right">
              <p className="font-black text-blue-600 text-lg">{fmt(total)}</p>
              <p className="text-[10px] text-slate-400">(Đã bao gồm VAT)</p>
            </div>
          </div>
        </div>

        {/* Promo */}
        <div className="px-5 pb-5">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text" placeholder="Nhập mã giảm giá"
                className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                value={promo} onChange={e => setPromo(e.target.value)}
              />
            </div>
            <button onClick={onApplyPromo} className="h-10 px-4 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-blue-600 transition-colors">
              Áp dụng
            </button>
          </div>
        </div>
      </div>

      {/* Why choose */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3">
        <p className="text-xs font-black text-slate-900 uppercase tracking-tight">Vì sao chọn LaptopDevice?</p>
        {[
          { icon: Shield, label: 'Sản phẩm chính hãng', sub: 'Cam kết 100% chính hãng' },
          { icon: Tag, label: 'Giá tốt nhất', sub: 'Luôn có giá tốt nhất thị trường' },
          { icon: Truck, label: 'Giao hàng toàn quốc', sub: 'Miễn phí giao hàng từ 500K' },
          { icon: RefreshCw, label: 'Đổi trả dễ dàng', sub: 'Đổi trả trong 30 ngày' },
        ].map(({ icon: Icon, label, sub }) => (
          <div key={label} className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
              <Icon size={13} className="text-blue-600" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">{label}</p>
              <p className="text-[11px] text-slate-500">{sub}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── Section block ──────────────────────────────────────────── */
function Section({ num, title, children }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 bg-slate-50/50">
        <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
          <span className="text-white text-xs font-black">{num}</span>
        </div>
        <h2 className="font-black text-slate-900 text-sm uppercase tracking-tight">{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  )
}

function Field({ label, required, icon: Icon, children, error }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <div className={`relative flex items-center rounded-xl border bg-white transition-all ${error ? 'border-red-400' : 'border-slate-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100'}`}>
        {Icon && <Icon size={14} className="absolute left-3 text-slate-400 pointer-events-none" />}
        {children}
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
const inputCls = (hasIcon) => `w-full h-11 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 outline-none ${hasIcon ? 'pl-9 pr-3' : 'px-3'}`

/* ─── CheckoutPage ───────────────────────────────────────────── */
function CheckoutPage() {
  const navigate = useNavigate()
  const { cart, loading } = useCart()

  const [step] = useState(2)
  const [promo, setPromo] = useState('')
  const [discount, setDiscount] = useState(0)
  const [payment, setPayment] = useState('cod')
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const [form, setForm] = useState({
    full_name: '', phone: '', email: '',
    address: '', province: 'TP. Hồ Chí Minh', district: 'Quận 1', ward: 'Phường Bến Nghé',
    shipping: 'standard', note: '',
  })

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const validate = () => {
    const e = {}
    if (!form.full_name.trim()) e.full_name = 'Vui lòng nhập họ và tên'
    if (!form.phone.trim()) e.phone = 'Vui lòng nhập số điện thoại'
    else if (!/^[0-9]{9,11}$/.test(form.phone.replace(/\s/g, ''))) e.phone = 'Số điện thoại không hợp lệ'
    if (!form.address.trim()) e.address = 'Vui lòng nhập địa chỉ'
    return e
  }

  const applyPromo = () => {
    if (promo.toUpperCase() === 'SAVE10') {
      setDiscount(Math.round((cart.subtotal || 0) * 0.1))
    } else {
      setDiscount(0)
      alert('Mã giảm giá không hợp lệ')
    }
  }

  const handleSubmit = async () => {
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    setSubmitError('')
    setSubmitting(true)
    
    try {
      const token = localStorage.getItem('ld_access')
      const headers = token ? { Authorization: `Bearer ${token}` } : {}
      
      const payload = {
        shipping_full_name: form.full_name.trim(),
        shipping_phone: form.phone.trim(),
        shipping_address: `${form.address.trim()}, ${form.ward}, ${form.district}, ${form.province}`,
        payment_method: payment,
      }
      
      const res = await axios.post('http://localhost:8000/api/payment/checkout-rest/', payload, {
        headers,
        withCredentials: true
      })
      
      const orderId = res.data.order_id
      navigate(`/order-success/${orderId}`, {
        state: { form, payment, cart: { ...cart }, discount, orderId }
      })
    } catch (err) {
      setSubmitError(err.response?.data?.error || err.message || 'Có lỗi xảy ra khi tạo đơn hàng. Vui lòng thử lại.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return (
    <div className="mx-4.5 py-6">
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-slate-200 rounded-xl w-48" />
        <div className="h-64 bg-slate-200 rounded-2xl" />
      </div>
    </div>
  )

  return (
    <div className="mx-4.5 py-6 pb-16">
      {/* Breadcrumb */}
      <nav className="mb-5 flex items-center gap-1.5 text-sm">
        <Link to="/" className="text-slate-500 hover:text-blue-600 font-medium">Trang chủ</Link>
        <ChevronRight size={13} className="text-slate-300" />
        <Link to="/cart" className="text-slate-500 hover:text-blue-600 font-medium">Giỏ hàng</Link>
        <ChevronRight size={13} className="text-slate-300" />
        <span className="text-blue-600 font-semibold">Thanh toán</span>
      </nav>

      <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-6">Thanh toán</h1>

      <StepBar current={step} />

      {submitError && (
        <div className="flex items-center gap-2.5 rounded-2xl bg-red-50 border border-red-200 px-5 py-4 text-sm text-red-700 font-bold mb-6">
          <AlertCircle size={18} className="shrink-0" />
          <span>{submitError}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">

        {/* ── LEFT ────────────────────────────────────────────── */}
        <div className="space-y-5">

          {/* 1. Shipping info */}
          <Section num="1" title="Thông tin giao hàng">
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Họ và tên" required icon={User} error={errors.full_name}>
                  <input type="text" placeholder="Nguyễn Văn A" className={inputCls(true)} value={form.full_name} onChange={set('full_name')} />
                </Field>
                <Field label="Số điện thoại" required icon={Phone} error={errors.phone}>
                  <input type="tel" placeholder="0901234567" className={inputCls(true)} value={form.phone} onChange={set('phone')} />
                </Field>
              </div>
              <Field label="Email" icon={Mail}>
                <input type="email" placeholder="email@example.com" className={inputCls(true)} value={form.email} onChange={set('email')} />
              </Field>
              <Field label="Địa chỉ nhận hàng" required icon={MapPin} error={errors.address}>
                <input type="text" placeholder="123 Đường ABC, Phường 1" className={inputCls(true)} value={form.address} onChange={set('address')} />
              </Field>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { k: 'province', label: 'Tỉnh / Thành phố', opts: PROVINCES },
                  { k: 'district', label: 'Quận / Huyện', opts: DISTRICTS[form.province] || DISTRICTS.default },
                  { k: 'ward',     label: 'Phường / Xã',   opts: WARDS },
                ].map(({ k, label, opts }) => (
                  <Field key={k} label={label} required>
                    <select className={inputCls(false) + ' cursor-pointer'} value={form[k]} onChange={set(k)}>
                      {opts.map(o => <option key={o}>{o}</option>)}
                    </select>
                  </Field>
                ))}
              </div>

              {/* Shipping method */}
              <div>
                <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Phương thức giao hàng</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { id: 'standard', label: 'Giao hàng tiêu chuẩn (2-3 ngày)', price: 0 },
                    { id: 'express',  label: 'Giao hàng nhanh (1-2 ngày)',       price: 30000 },
                  ].map(s => (
                    <label key={s.id} className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 cursor-pointer transition-all ${form.shipping === s.id ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'}`}>
                      <input type="radio" name="shipping" value={s.id} checked={form.shipping === s.id} onChange={set('shipping')} className="accent-blue-600" />
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-slate-800">{s.label}</p>
                      </div>
                      <span className={`text-xs font-black ${s.price === 0 ? 'text-green-600' : 'text-slate-700'}`}>
                        {s.price === 0 ? 'Miễn phí' : fmt(s.price)}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <Field label="Ghi chú cho đơn hàng (tùy chọn)">
                <textarea
                  rows={2}
                  placeholder="Vd: Giao hàng giờ hành chính, gọi trước khi giao..."
                  className="w-full px-3 py-2.5 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 outline-none resize-none"
                  value={form.note} onChange={set('note')}
                />
              </Field>
            </div>
          </Section>

          {/* 2. Payment method */}
          <Section num="2" title="Phương thức thanh toán">
            <div className="space-y-2.5">
              {PAYMENT_METHODS.map(pm => (
                <label key={pm.id} className={`flex items-center gap-4 px-4 py-3.5 rounded-xl border-2 cursor-pointer transition-all ${payment === pm.id ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'}`}>
                  <input type="radio" name="payment" value={pm.id} checked={payment === pm.id} onChange={() => setPayment(pm.id)} className="accent-blue-600 shrink-0" />
                  <span className="text-lg shrink-0">{pm.icon}</span>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-800">{pm.label}</p>
                    <p className="text-xs text-slate-500">{pm.sub}</p>
                  </div>
                </label>
              ))}
              <div className="flex items-center gap-2 pt-2 text-xs text-slate-500">
                <Shield size={13} className="text-green-600" />
                Thông tin thanh toán của bạn được bảo mật tuyệt đối.
              </div>
            </div>
          </Section>
        </div>

        {/* ── RIGHT ───────────────────────────────────────────── */}
        <OrderSidebar cart={cart} promo={promo} setPromo={setPromo} discount={discount} onApplyPromo={applyPromo} />
      </div>

      {/* Bottom actions */}
      <div className="mt-6 flex items-center justify-between gap-4 flex-wrap">
        <Link to="/cart" className="flex items-center gap-2 px-5 h-11 rounded-xl border border-slate-300 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all">
          <ChevronLeft size={16} /> Quay lại giỏ hàng
        </Link>
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="flex items-center gap-2 px-7 h-11 rounded-xl bg-blue-600 text-white text-sm font-black shadow-[0_8px_20px_rgba(37,99,235,0.3)] hover:bg-blue-700 hover:-translate-y-0.5 transition-all disabled:opacity-60"
        >
          {submitting ? 'Đang xử lý...' : <>Tiếp tục xác nhận đơn hàng <ChevronRight size={16} /></>}
        </button>
      </div>
    </div>
  )
}

export default CheckoutPage

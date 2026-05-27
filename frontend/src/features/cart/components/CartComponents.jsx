import { useState } from 'react'
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Package, Zap, ChevronRight, Tag } from 'lucide-react'
import { Link } from 'react-router-dom'

const fmt = (n) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', minimumFractionDigits: 0 }).format(n)

/* ─────────────────────────────────────────────────────────────────
   CART ITEM ROW
───────────────────────────────────────────────────────────────── */
export function CartItemRow({ item, onUpdate, onRemove, disabled }) {
  const [localQty, setLocalQty] = useState(item.quantity)
  const [removing, setRemoving] = useState(false)

  const changeQty = (newQty) => {
    if (newQty < 1) return
    setLocalQty(newQty)
    onUpdate(item.product_id, newQty)
  }

  const handleRemove = async () => {
    setRemoving(true)
    await onRemove(item.product_id)
  }

  return (
    <div className={`flex gap-5 p-5 bg-white rounded-2xl border border-slate-200 transition-all duration-300 ${removing ? 'opacity-40 scale-95' : ''}`}>
      {/* Product image */}
      <Link to={`/products/${item.product_id}`} className="flex-none w-24 h-24 md:w-28 md:h-28 bg-slate-50 rounded-xl overflow-hidden border border-slate-100 flex items-center justify-center">
        {item.image ? (
          <img src={item.image} alt={item.name} className="w-full h-full object-contain p-2" />
        ) : (
          <ShoppingBag className="w-10 h-10 text-slate-300" />
        )}
      </Link>

      {/* Info */}
      <div className="flex-1 min-w-0 flex flex-col justify-between gap-3">
        <div>
          {item.category && (
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wide">{item.category}</span>
          )}
          <Link to={`/products/${item.product_id}`}>
            <h3 className="text-sm font-bold text-slate-900 mt-0.5 line-clamp-2 leading-snug hover:text-blue-600 transition-colors">{item.name}</h3>
          </Link>
          <p className="text-sm font-semibold text-blue-600 mt-1">{fmt(item.price)} / sản phẩm</p>
        </div>

        <div className="flex items-center justify-between flex-wrap gap-3">
          {/* Quantity control */}
          <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden bg-slate-50">
            <button
              disabled={disabled || localQty <= 1}
              onClick={() => changeQty(localQty - 1)}
              className="w-9 h-9 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Minus size={14} />
            </button>
            <span className="w-10 text-center text-sm font-bold text-slate-900">{localQty}</span>
            <button
              disabled={disabled}
              onClick={() => changeQty(localQty + 1)}
              className="w-9 h-9 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Plus size={14} />
            </button>
          </div>

          {/* Subtotal + Delete */}
          <div className="flex items-center gap-4">
            <span className="text-base font-black text-slate-900">{fmt(item.subtotal)}</span>
            <button
              onClick={handleRemove}
              disabled={disabled}
              className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all disabled:opacity-40"
              title="Xóa sản phẩm"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────
   SHIPPING SELECTOR
───────────────────────────────────────────────────────────────── */
export function ShippingSelector({ selected, onChange, disabled }) {
  const options = [
    {
      id: 'normal',
      icon: <Package size={18} />,
      label: 'Giao hàng tiêu chuẩn',
      desc: '3 – 5 ngày làm việc',
      price: 20000,
    },
    {
      id: 'express',
      icon: <Zap size={18} />,
      label: 'Giao hàng nhanh',
      desc: '1 – 2 ngày làm việc',
      price: 100000,
    },
  ]

  return (
    <div className="space-y-3">
      {options.map((opt) => {
        const active = selected === opt.id
        return (
          <button
            key={opt.id}
            disabled={disabled}
            onClick={() => onChange(opt.id)}
            className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all ${
              active
                ? 'border-blue-600 bg-blue-50'
                : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <span className={`flex-none w-10 h-10 rounded-full flex items-center justify-center ${active ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
              {opt.icon}
            </span>
            <div className="flex-1">
              <p className={`text-sm font-bold ${active ? 'text-blue-700' : 'text-slate-800'}`}>{opt.label}</p>
              <p className="text-xs text-slate-500 mt-0.5">{opt.desc}</p>
            </div>
            <span className={`text-sm font-bold flex-none ${active ? 'text-blue-600' : 'text-slate-600'}`}>
              {fmt(opt.price)}
            </span>
            <div className={`w-5 h-5 rounded-full border-2 flex-none flex items-center justify-center ${active ? 'border-blue-600 bg-blue-600' : 'border-slate-300'}`}>
              {active && <div className="w-2 h-2 rounded-full bg-white" />}
            </div>
          </button>
        )
      })}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────
   ORDER SUMMARY
───────────────────────────────────────────────────────────────── */
export function OrderSummary({ cart, actionLoading }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-100">
        <h2 className="text-base font-black text-slate-900 uppercase tracking-tight">Tóm tắt đơn hàng</h2>
      </div>

      <div className="p-6 space-y-4">
        {/* Rows */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">Tạm tính ({cart.total_qty} sản phẩm)</span>
          <span className="font-semibold text-slate-800">{fmt(cart.subtotal)}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">Phí vận chuyển</span>
          <span className="font-semibold text-slate-800">{fmt(cart.shipping_cost)}</span>
        </div>

        {/* Divider */}
        <div className="h-px bg-slate-100" />

        {/* Total */}
        <div className="flex items-center justify-between">
          <span className="text-base font-bold text-slate-900">Tổng cộng</span>
          <span className="text-xl font-black text-blue-600">{fmt(cart.total)}</span>
        </div>

        {/* VAT note */}
        <p className="text-xs text-slate-400 text-right">Đã bao gồm VAT</p>

        {/* Checkout Button */}
        <Link
          to="/checkout"
          className="flex items-center justify-center gap-2 w-full h-13 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 active:scale-95 transition-all shadow-md hover:shadow-lg mt-2"
          style={{ height: '52px' }}
        >
          Tiến hành thanh toán
          <ArrowRight size={18} />
        </Link>

        {/* Continue shopping */}
        <Link
          to="/products"
          className="flex items-center justify-center gap-1.5 w-full text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors pt-1"
        >
          <ChevronRight size={16} className="rotate-180" />
          Tiếp tục mua sắm
        </Link>
      </div>

      {/* Trust badges */}
      <div className="px-6 pb-6 grid grid-cols-2 gap-2">
        {[
          { icon: '🔒', label: 'Thanh toán an toàn' },
          { icon: '🚚', label: 'Miễn phí đổi trả 30 ngày' },
          { icon: '🛡️', label: 'Bảo hành chính hãng' },
          { icon: '📦', label: 'Giao hàng toàn quốc' },
        ].map(({ icon, label }) => (
          <div key={label} className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 rounded-lg px-3 py-2">
            <span>{icon}</span>
            <span>{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────
   EMPTY CART
───────────────────────────────────────────────────────────────── */
export function EmptyCart() {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-6 text-center">
      <div className="relative">
        <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center">
          <ShoppingBag className="w-12 h-12 text-blue-300" />
        </div>
        <div className="absolute -top-1 -right-1 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
          <span className="text-red-500 font-black text-sm">0</span>
        </div>
      </div>
      <div>
        <h2 className="text-2xl font-black text-slate-900 mb-2">Giỏ hàng trống</h2>
        <p className="text-slate-500 text-sm max-w-xs mx-auto">Bạn chưa có sản phẩm nào trong giỏ hàng. Hãy khám phá ngay!</p>
      </div>
      <Link
        to="/products"
        className="inline-flex items-center gap-2 px-8 h-12 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 active:scale-95 transition-all shadow-md"
      >
        <Tag size={16} />
        Khám phá sản phẩm
      </Link>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────
   CART SKELETON
───────────────────────────────────────────────────────────────── */
export function CartSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex gap-5 p-5 bg-white rounded-2xl border border-slate-200">
          <div className="w-28 h-28 bg-slate-200 rounded-xl flex-none" />
          <div className="flex-1 space-y-3 py-1">
            <div className="h-3 bg-slate-200 rounded w-16" />
            <div className="h-4 bg-slate-200 rounded w-4/5" />
            <div className="h-4 bg-slate-200 rounded w-1/2" />
            <div className="flex justify-between pt-2">
              <div className="h-9 bg-slate-200 rounded-xl w-28" />
              <div className="h-5 bg-slate-200 rounded w-28" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────
   CART ERROR
───────────────────────────────────────────────────────────────── */
export function CartError({ error, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-5 text-center">
      <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
        <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        </svg>
      </div>
      <div>
        <p className="font-bold text-slate-900 mb-1">Không thể tải giỏ hàng</p>
        <p className="text-sm text-slate-500">{error}</p>
      </div>
      <button onClick={onRetry} className="px-6 h-11 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 active:scale-95 transition-all">
        Thử lại
      </button>
    </div>
  )
}

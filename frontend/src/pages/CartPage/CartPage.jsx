import { Link } from 'react-router-dom'
import { ShoppingCart, ChevronRight } from 'lucide-react'
import { useCart } from '../../features/cart/hooks/useCart'
import {
  CartItemRow,
  ShippingSelector,
  OrderSummary,
  EmptyCart,
  CartSkeleton,
  CartError,
} from '../../features/cart/components/CartComponents'

/**
 * CartPage — Full shopping cart with item management, shipping selector, and order summary
 */
function CartPage() {
  const { cart, loading, error, actionLoading, fetchCart, updateItem, removeItem, changeShipping } = useCart()

  return (
    <div className="mx-4.5 py-6 pb-16">

      {/* ── Breadcrumb ── */}
        <nav className="mb-6 flex items-center gap-1.5 text-sm">
          <Link to="/" className="text-slate-500 hover:text-blue-600 transition-colors font-medium">Trang chủ</Link>
          <ChevronRight size={14} className="text-slate-300" />
          <span className="text-slate-900 font-semibold">Giỏ hàng</span>
        </nav>

        {/* ── Page Header ── */}
        <div className="mb-8 flex items-center gap-3 border-b border-slate-200 pb-5">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center flex-none">
            <ShoppingCart className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 uppercase tracking-tight">Giỏ hàng</h1>
            {!loading && !error && (
              <p className="text-sm text-slate-500 mt-0.5">
                {cart.item_count > 0
                  ? `${cart.item_count} sản phẩm • ${cart.total_qty} món`
                  : 'Chưa có sản phẩm nào'}
              </p>
            )}
          </div>
        </div>

        {/* ── LOADING ── */}
        {loading && (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
            <CartSkeleton />
            <div className="h-80 bg-white rounded-2xl border border-slate-200 animate-pulse" />
          </div>
        )}

        {/* ── ERROR ── */}
        {error && !loading && <CartError error={error} onRetry={fetchCart} />}

        {/* ── EMPTY ── */}
        {!loading && !error && cart.item_count === 0 && <EmptyCart />}

        {/* ── CART WITH ITEMS ── */}
        {!loading && !error && cart.item_count > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 items-start">

            {/* LEFT: Items + Shipping */}
            <div className="space-y-6">
              {/* Item list */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Sản phẩm đã chọn</h2>
                  <button
                    onClick={fetchCart}
                    className="text-xs font-semibold text-blue-600 hover:underline"
                  >
                    Làm mới
                  </button>
                </div>

                {cart.items.map((item) => (
                  <CartItemRow
                    key={`${item.product_id}_${item.variant_id || ''}`}
                    item={item}
                    onUpdate={updateItem}
                    onRemove={removeItem}
                    disabled={actionLoading}
                  />
                ))}
              </div>

              {/* Shipping method */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-4">Phương thức vận chuyển</h2>
                <ShippingSelector
                  selected={cart.shipping_method}
                  onChange={changeShipping}
                  disabled={actionLoading}
                />
              </div>

              {/* Promo code placeholder */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-4">Mã giảm giá</h2>
                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder="Nhập mã khuyến mãi..."
                    className="flex-1 h-11 px-4 rounded-xl border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                  <button className="h-11 px-5 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 active:scale-95 transition-all">
                    Áp dụng
                  </button>
                </div>
              </div>
            </div>

            {/* RIGHT: Order Summary (sticky) */}
            <div className="lg:sticky lg:top-24">
              <OrderSummary cart={cart} actionLoading={actionLoading} />
            </div>
          </div>
        )}
    </div>
  )
}

export default CartPage

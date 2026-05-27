import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Heart, ShoppingCart, Trash2, Star } from 'lucide-react'
import { useWishlistStore } from '../../../../hooks/useWishlistStore'
import { addToCart } from '../../../../services/cartApi'
import { formatPrice } from '../../../../shared/utils/formatters'

export function WishlistTab() {
  const { wishlist, loading, error, fetchWishlist, removeItem, clearWishlist } = useWishlistStore()

  useEffect(() => {
    fetchWishlist()
  }, [fetchWishlist])

  const handleRemove = async (id) => {
    await removeItem(id)
  }

  const handleClearAll = async () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tất cả sản phẩm khỏi danh sách yêu thích?')) {
      await clearWishlist()
    }
  }

  const handleAddToCart = async (product) => {
    try {
      await addToCart(product.id, 1)
      alert('Đã thêm sản phẩm vào giỏ hàng!')
    } catch (err) {
      console.error(err)
      alert('Không thể thêm sản phẩm vào giỏ hàng.')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-700 p-4 rounded-xl text-center border border-red-200">
        {error}
      </div>
    )
  }

  if (wishlist.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-slate-400">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-2">
          <Heart size={36} className="text-red-300" />
        </div>
        <div className="text-center">
          <p className="font-black text-slate-800 text-lg mb-1">Danh sách yêu thích trống</p>
          <p className="text-sm text-slate-500 max-w-sm">Bạn chưa có sản phẩm nào trong danh sách yêu thích.</p>
          <Link to="/products" className="inline-flex items-center justify-center h-10 px-6 mt-6 rounded-xl bg-blue-600 text-white text-sm font-bold shadow-md hover:bg-blue-700 transition-colors">
            Khám phá ngay
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">Bạn đang có <strong className="text-slate-800">{wishlist.length}</strong> sản phẩm đã lưu.</span>
        </div>
        <button onClick={handleClearAll} className="text-sm font-bold text-slate-500 hover:text-red-600 transition-colors flex items-center gap-1.5">
          <Trash2 size={15} /> Xóa tất cả
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {wishlist.map(product => {
          const salePrice = product.sale_price || product.price
          const hasDiscount = product.discount_percentage > 0

          return (
            <div key={product.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group flex flex-col relative">
              <button 
                onClick={() => handleRemove(product.id)}
                className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full bg-white/90 backdrop-blur flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                title="Xóa khỏi danh sách"
              >
                <Trash2 size={14} />
              </button>

              <Link to={`/products/${product.id}`} className="block relative aspect-[4/3] bg-slate-50 p-4">
                {product.image ? (
                  <img src={product.image} alt={product.name} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-50 text-slate-400">Không có ảnh</div>
                )}
              </Link>

              <div className="p-4 flex-1 flex flex-col">
                <Link to={`/products/${product.id}`}>
                  <h3 className="text-sm font-bold text-slate-800 leading-snug group-hover:text-blue-600 transition-colors line-clamp-2 mb-1.5" title={product.name}>
                    {product.name}
                  </h3>
                </Link>
                
                <div className="flex items-center gap-1 mb-3">
                  <Star size={12} className="text-amber-400 fill-amber-400" />
                  <span className="text-xs font-bold text-slate-700">{product.average_rating || '4.5'}</span>
                  <span className="text-[10px] text-slate-400">({product.review_count || '0'})</span>
                </div>

                <div className="mt-auto mb-3">
                  <div className="text-base font-black text-red-600">{formatPrice(salePrice)}</div>
                  {hasDiscount && (
                    <div className="text-[11px] text-slate-400 line-through font-medium mt-0.5">{formatPrice(product.price)}</div>
                  )}
                </div>

                <button 
                  onClick={() => handleAddToCart(product)}
                  className="w-full py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white"
                >
                  <ShoppingCart size={15} />
                  Thêm vào giỏ
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Heart, ShoppingCart, Trash2, ChevronRight, Star } from 'lucide-react'
import { useWishlistStore } from '../../hooks/useWishlistStore'
import { addToCart } from '../../services/cartApi'
import { formatPrice } from '../../shared/utils/formatters'

export default function WishlistPage() {
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

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      
      {/* Breadcrumb */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-[1200px] mx-auto px-4 py-3 flex items-center gap-2 text-sm">
          <Link to="/" className="text-slate-500 hover:text-blue-600 font-medium">Trang chủ</Link>
          <ChevronRight size={14} className="text-slate-400" />
          <Link to="/profile" className="text-slate-500 hover:text-blue-600 font-medium">Tài khoản</Link>
          <ChevronRight size={14} className="text-slate-400" />
          <span className="text-blue-600 font-bold">Sản phẩm yêu thích</span>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 mt-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 flex items-center gap-3">
              <Heart className="text-red-500 fill-red-500" size={28} />
              Sản phẩm yêu thích
            </h1>
            <p className="text-slate-500 mt-2">Bạn đang có <span className="font-bold text-slate-800">{wishlist.length}</span> sản phẩm trong danh sách.</p>
          </div>
          {wishlist.length > 0 && (
            <button onClick={handleClearAll} className="text-slate-500 hover:text-red-600 font-medium text-sm transition-colors flex items-center gap-1.5">
              <Trash2 size={16} /> Xóa tất cả
            </button>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-700 p-4 rounded-xl text-center border border-red-200">
            {error}
          </div>
        ) : wishlist.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-sm flex flex-col items-center justify-center min-h-[400px]">
            <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-6">
              <Heart size={48} className="text-red-300" />
            </div>
            <h2 className="text-2xl font-black text-slate-800 mb-3">Danh sách yêu thích trống</h2>
            <p className="text-slate-500 max-w-md mx-auto mb-8">Hãy thêm những sản phẩm bạn yêu thích vào đây để dễ dàng theo dõi giá và mua sắm sau này nhé!</p>
            <Link to="/products" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl shadow-md shadow-blue-600/20 transition-all hover:-translate-y-1">
              Khám phá sản phẩm ngay
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlist.map(product => {
              const salePrice = product.sale_price || product.price
              const hasDiscount = product.discount_percentage > 0

              return (
                <div key={product.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col relative">
                  
                  {/* Remove Button */}
                  <button 
                    onClick={() => handleRemove(product.id)}
                    className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 shadow-sm transition-colors"
                    title="Xóa khỏi danh sách"
                  >
                    <Trash2 size={16} />
                  </button>

                  {/* Product Image */}
                  <Link to={`/products/${product.id}`} className="block relative aspect-square overflow-hidden bg-slate-100 p-4">
                    {product.image ? (
                      <img src={product.image} alt={product.name} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-50">Tài liệu hình ảnh trống</div>
                    )}
                  </Link>

                  {/* Product Info */}
                  <div className="p-5 flex-1 flex flex-col">
                    <Link to={`/products/${product.id}`}>
                      <h3 className="text-slate-800 font-bold leading-snug group-hover:text-blue-600 transition-colors line-clamp-2 mb-2" title={product.name}>
                        {product.name}
                      </h3>
                    </Link>
                    
                    <div className="flex items-center gap-1 mb-3">
                      <Star size={14} className="text-amber-400 fill-amber-400" />
                      <span className="text-sm font-bold text-slate-700">{product.average_rating || '4.5'}</span>
                      <span className="text-xs text-slate-400">({product.review_count || '0'})</span>
                    </div>

                    <div className="mt-auto mb-4">
                      <div className="text-lg font-black text-red-600">{formatPrice(salePrice)}</div>
                      {hasDiscount && (
                        <div className="text-xs text-slate-400 line-through font-medium mt-0.5">{formatPrice(product.price)}</div>
                      )}
                    </div>

                    {/* Add to Cart Button */}
                    <button 
                      onClick={() => handleAddToCart(product)}
                      className="w-full py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white"
                    >
                      <ShoppingCart size={18} />
                      Thêm vào giỏ
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

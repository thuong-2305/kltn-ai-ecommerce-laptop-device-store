import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { useProductDetail } from './hooks/useProductDetail'
import { addToCart } from '../../services/cartApi'
import { useWishlistStore } from '../../hooks/useWishlistStore'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import {
  ProductImageGallery,
  ProductInfo,
  ProductSpecs,
  ProductReviews,
  ProductDetailSkeleton,
  ProductDetailError,
} from './components/ProductDetailComponents'
import ProductCard from '../ProductListPage/components/ProductCard'

const TABS = [
  { id: 'specs', label: 'Thông số kỹ thuật' },
  { id: 'description', label: 'Mô tả sản phẩm' },
  { id: 'reviews', label: 'Đánh giá' },
]

/**
 * ProductDetailPage — Full product detail with gallery, specs, reviews, related products
 */
function ProductDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { product, loading, error, refetch } = useProductDetail(id)
  const [activeTab, setActiveTab] = useState('specs')
  const [cartMsg, setCartMsg] = useState(null)
  const toggleWishlist = useWishlistStore(state => state.toggleWishlist)
  useDocumentTitle(
    product?.name,
    product?.short_description || 'Thông tin chi tiết laptop gaming, văn phòng, đồ họa chính hãng tại LAPTOP DEVICE STORE.'
  )

  const showMsg = (msg, type = 'success') => {
    setCartMsg({ text: msg, type })
    setTimeout(() => setCartMsg(null), 3000)
  }

  const handleAddToCart = async (product, qty = 1) => {
    try {
      await addToCart(product.id, qty)
      showMsg(`Đã thêm "${product.name}" vào giỏ hàng!`, 'success')
    } catch {
      showMsg('Không thể thêm sản phẩm. Vui lòng thử lại.', 'error')
    }
  }

  const handleAddToWishlist = async (product) => {
    try {
      const res = await toggleWishlist(product)
      showMsg(res.message, 'success')
    } catch {
      showMsg('Thao tác danh sách yêu thích thất bại.', 'error')
    }
  }

  return (
    <div className="relative">
      {/* Toast Notification */}
      {cartMsg && (
        <div className={`fixed top-6 right-6 z-50 max-w-sm flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl border text-sm font-semibold transition-all animate-in slide-in-from-top-4 ${
          cartMsg.type === 'success'
            ? 'bg-white border-green-200 text-green-700'
            : 'bg-white border-red-200 text-red-700'
        }`}>
          <span>{cartMsg.type === 'success' ? '✅' : '❌'}</span>
          <span className="flex-1">{cartMsg.text}</span>
          {cartMsg.type === 'success' && (
            <Link to="/cart" className="text-blue-600 hover:underline font-bold whitespace-nowrap ml-1">
              Xem giỏ →
            </Link>
          )}
        </div>
      )}

      <div className="mx-4.5 py-6 pb-16">

        {/* ── LOADING ── */}
        {loading && <ProductDetailSkeleton />}

        {/* ── ERROR ── */}
        {error && !loading && <ProductDetailError error={error} onRetry={refetch} />}

        {/* ── CONTENT ── */}
        {!loading && !error && product && (
          <>
            {/* Breadcrumb */}
            <nav className="mb-8 flex items-center gap-1.5 text-sm flex-wrap">
              <Link to="/" className="text-slate-500 hover:text-blue-600 transition-colors font-medium">Trang chủ</Link>
              <ChevronRight size={14} className="text-slate-300" />
              <Link to="/products" className="text-slate-500 hover:text-blue-600 transition-colors font-medium">Sản phẩm</Link>
              {product.category?.name && (
                <>
                  <ChevronRight size={14} className="text-slate-300" />
                  <Link
                    to={`/products?category=${product.category.id}`}
                    className="text-slate-500 hover:text-blue-600 transition-colors font-medium"
                  >
                    {product.category.name}
                  </Link>
                </>
              )}
              <ChevronRight size={14} className="text-slate-300" />
              <span className="text-slate-900 font-semibold line-clamp-1">{product.name}</span>
            </nav>

            {/* ── MAIN LAYOUT: Gallery + Info ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-16 mb-12">
              <ProductImageGallery
                image={product.image}
                thumbnails={product.thumbnails}
                name={product.name}
              />
              <ProductInfo
                product={product}
                onAddToCart={handleAddToCart}
                onAddToWishlist={handleAddToWishlist}
              />
            </div>

            {/* ── TABS: Specs / Description / Reviews ── */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-12">
              {/* Tab header */}
              <div className="flex border-b border-slate-200 overflow-x-auto">
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-6 py-4 text-sm font-semibold whitespace-nowrap border-b-2 transition-all ${
                      activeTab === tab.id
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
                    }`}
                  >
                    {tab.label}
                    {tab.id === 'reviews' && product.review_count > 0 && (
                      <span className="ml-2 text-xs bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded-full">
                        {product.review_count}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              <div className="p-6 md:p-8">
                {activeTab === 'specs' && (
                  <ProductSpecs config={product.config} description="" />
                )}
                {activeTab === 'description' && (
                  <ProductSpecs config={[]} description={product.description} />
                )}
                {activeTab === 'reviews' && (
                  <ProductReviews
                    reviews={product.reviews}
                    averageRating={product.average_rating}
                    reviewCount={product.review_count}
                    ratingDistribution={product.rating_distribution}
                  />
                )}
              </div>
            </div>

            {/* ── RELATED PRODUCTS ── */}
            {product.related_products?.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Sản phẩm liên quan</h2>
                  <Link
                    to={`/products?category=${product.category?.id}`}
                    className="text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1"
                  >
                    Xem tất cả <ChevronRight size={16} />
                  </Link>
                </div>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {product.related_products.map((related) => (
                    <ProductCard
                      key={related.id}
                      product={related}
                      onAddToCart={handleAddToCart}
                      onAddToWishlist={handleAddToWishlist}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default ProductDetailPage

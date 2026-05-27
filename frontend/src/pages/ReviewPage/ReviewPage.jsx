import { useParams, Link, useLocation } from 'react-router-dom'
import { ChevronRight, CheckCircle2, Star } from 'lucide-react'
import { useReview } from './hooks/useReview'
import {
  PurchasedProduct, ReviewForm, ReviewSidebar,
  RatingOverview, ReviewCard, StarDisplay
} from './components/ReviewComponents'

function Skeleton({ cls }) { return <div className={`animate-pulse bg-slate-200 rounded-xl ${cls}`} /> }

function ReviewPage() {
  const { productId } = useParams()
  const location = useLocation()
  const orderId = location.state?.orderId || new URLSearchParams(location.search).get('order') || null

  const { product, reviews, stats, existingReview, loading, submitting, error, submitReview } = useReview(productId)

  const handleSubmit = async (formData) => {
    return await submitReview({ ...formData, product_id: Number(productId) })
  }

  return (
    <div className="mx-4.5 py-6 pb-16">

      {/* ── Breadcrumb ─────────────────────────────────────────── */}
      <nav className="mb-4 flex items-center gap-1.5 text-sm flex-wrap">
        <Link to="/" className="text-slate-500 hover:text-blue-600 font-medium">Trang chủ</Link>
        <ChevronRight size={13} className="text-slate-300" />
        <Link to="/profile" className="text-slate-500 hover:text-blue-600 font-medium">Tài khoản</Link>
        <ChevronRight size={13} className="text-slate-300" />
        <Link to="/profile" onClick={() => {}} className="text-slate-500 hover:text-blue-600 font-medium">Đơn hàng của tôi</Link>
        <ChevronRight size={13} className="text-slate-300" />
        <span className="text-blue-600 font-semibold">Đánh giá sản phẩm</span>
      </nav>

      {/* ── Page title ─────────────────────────────────────────── */}
      <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-5">Đánh giá sản phẩm</h1>

      {/* ── Thank you banner ───────────────────────────────────── */}
      <div className="flex items-start gap-3 px-5 py-4 mb-5 rounded-2xl bg-green-50 border border-green-200">
        <CheckCircle2 size={18} className="text-green-600 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-black text-green-800">Cảm ơn bạn đã mua hàng tại LaptopDevice!</p>
          <p className="text-xs text-green-700 mt-0.5">Hãy chia sẻ trải nghiệm của bạn về sản phẩm để giúp chúng tôi phục vụ bạn tốt hơn.</p>
        </div>
      </div>

      {/* ── Error ──────────────────────────────────────────────── */}
      {error && (
        <div className="px-4 py-3 mb-5 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700 font-medium">{error}</div>
      )}

      {/* ── Loading skeleton ────────────────────────────────────── */}
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_288px] gap-6">
          <div className="space-y-5">
            <Skeleton cls="h-36" />
            <Skeleton cls="h-80" />
          </div>
          <div className="space-y-4">
            <Skeleton cls="h-48" />
            <Skeleton cls="h-48" />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_288px] gap-6 items-start">

          {/* ── MAIN CONTENT ──────────────────────────────────── */}
          <div className="space-y-5">

            {/* Purchased product card */}
            <PurchasedProduct product={product} orderId={orderId} />

            {/* Review form */}
            <ReviewForm onSubmit={handleSubmit} submitting={submitting} initial={existingReview} />

            {/* Existing reviews section */}
            {reviews.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-slate-900 uppercase tracking-tight text-sm">
                    Đánh giá từ khách hàng ({stats.total})
                  </h3>
                  {stats.avg_rating > 0 && (
                    <div className="flex items-center gap-1.5">
                      <Star size={14} className="text-yellow-400 fill-yellow-400" />
                      <span className="font-black text-slate-900 text-sm">{Number(stats.avg_rating).toFixed(1)}</span>
                      <span className="text-xs text-slate-500">/ 5</span>
                    </div>
                  )}
                </div>

                <RatingOverview stats={stats} />

                <div className="space-y-3">
                  {reviews.map(r => <ReviewCard key={r.id} review={r} />)}
                </div>
              </div>
            )}

            {reviews.length === 0 && !loading && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center">
                <Star size={36} className="text-slate-200 mx-auto mb-3" />
                <p className="font-bold text-slate-700">Chưa có đánh giá nào</p>
                <p className="text-sm text-slate-500 mt-1">Hãy là người đầu tiên đánh giá sản phẩm này!</p>
              </div>
            )}
          </div>

          {/* ── SIDEBAR ───────────────────────────────────────── */}
          <ReviewSidebar />
        </div>
      )}
    </div>
  )
}

export default ReviewPage

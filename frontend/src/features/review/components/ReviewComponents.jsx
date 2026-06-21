import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../../contexts/AuthContext'
import {
  Star, Package, CheckCircle2, AlertCircle, Upload, X,
  Plus, Loader2, Edit3, Shield, Lightbulb, Image, Phone, Mail, Check,
  Smile, Frown, Meh
} from 'lucide-react'

const fmt = (n) => Number(n || 0).toLocaleString('vi-VN') + '₫'

/* ─── Star Rating Input ──────────────────────────────────────── */
const STAR_LABELS = { 1: 'Rất tệ', 2: 'Tệ', 3: 'Bình thường', 4: 'Tốt', 5: 'Tuyệt vời' }
const STAR_COLORS = { 1: 'text-red-500', 2: 'text-orange-500', 3: 'text-yellow-500', 4: 'text-blue-500', 5: 'text-green-600' }

export function StarInput({ value, onChange }) {
  const [hovered, setHovered] = useState(0)
  const active = hovered || value
  return (
    <div className="flex items-center gap-1.5">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n} type="button"
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(n)}
          className="transition-transform hover:scale-110 active:scale-95"
        >
          <Star
            size={32}
            className={`transition-colors ${n <= active ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200'}`}
          />
        </button>
      ))}
      {active > 0 && (
        <span className={`ml-2 text-sm font-bold ${STAR_COLORS[active]}`}>{STAR_LABELS[active]}</span>
      )}
    </div>
  )
}

/* ─── Star Display (read-only) ───────────────────────────────── */
export function StarDisplay({ value = 0, size = 16 }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(n => (
        <Star key={n} size={size}
          className={n <= Math.round(value) ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200 fill-slate-200'}
        />
      ))}
    </div>
  )
}

/* ─── Product card (the purchased product) ──────────────────── */
export function PurchasedProduct({ product, orderId }) {
  if (!product) return null
  const price = product.sale_price || product.price || 0
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 mb-5">
      <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4">Sản phẩm đã mua</h2>
      <div className="flex gap-4 items-start">
        {/* Image */}
        <div className="w-20 h-20 md:w-24 md:h-24 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0">
          {product.image
            ? <img src={product.image} alt={product.name} className="w-full h-full object-contain p-1.5" />
            : <Package size={28} className="text-slate-300" />
          }
        </div>
        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="font-black text-slate-900 text-sm leading-snug line-clamp-2">{product.name}</p>
          {product.category?.name && (
            <p className="text-xs text-slate-500 mt-0.5">Phân loại: {product.category.name}</p>
          )}
          <p className="text-blue-600 font-black text-base mt-1.5">{fmt(price)}</p>
          <p className="text-xs text-slate-400">Số lượng: 1</p>
        </div>
        {/* Order info */}
        {orderId && (
          <div className="shrink-0 text-right hidden sm:block">
            <p className="text-xs text-slate-500">Mã đơn hàng</p>
            <p className="text-sm font-black text-slate-800">#{orderId}</p>
            <p className="text-xs text-slate-400 mt-1">Đã giao ngày: {new Date().toLocaleDateString('vi-VN')}</p>
            <Link to={`/order-tracking/${orderId}`}
              className="mt-2 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-blue-200 text-blue-600 text-xs font-bold hover:bg-blue-50 transition-all">
              Xem chi tiết đơn hàng
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

/* ─── Image upload grid ──────────────────────────────────────── */
export function ImageUploader({ images, onAdd, onRemove }) {
  const inputRef = useRef()
  const MAX = 5

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files)
    files.forEach(file => {
      if (images.length >= MAX) return
      const reader = new FileReader()
      reader.onload = (ev) => onAdd({ src: ev.target.result, file })
      reader.readAsDataURL(file)
    })
    e.target.value = ''
  }

  return (
    <div>
      <div className="flex gap-3 flex-wrap">
        {images.map((img, i) => (
          <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-200 group">
            <img src={img.src} alt="" className="w-full h-full object-cover" />
            <button
              type="button" onClick={() => onRemove(i)}
              className="absolute top-1 right-1 w-5 h-5 rounded-full bg-slate-900/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X size={11} />
            </button>
          </div>
        ))}
        {images.length < MAX && (
          <button
            type="button" onClick={() => inputRef.current?.click()}
            className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center gap-1 text-slate-400 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 transition-all"
          >
            <Plus size={18} />
            <span className="text-[10px] font-semibold">Thêm ảnh</span>
          </button>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/*,video/*" multiple className="hidden" onChange={handleFileChange} />
      <p className="text-xs text-slate-400 mt-2">
        Bạn có thể tải lên tối đa {MAX} hình ảnh hoặc 1 video (dung lượng tối đa 10MB/ảnh)
      </p>
    </div>
  )
}

/* ─── Review Form ────────────────────────────────────────────── */
export function ReviewForm({ onSubmit, submitting }) {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [errors, setErrors] = useState({})
  const [toast, setToast] = useState(null)

  const validate = () => {
    const e = {}
    if (!rating) e.rating = 'Vui lòng chọn số sao'
    if (!comment.trim()) e.comment = 'Vui lòng nhập nội dung bình luận'
    else if (comment.length < 10) e.comment = 'Nội dung bình luận quá ngắn (tối thiểu 10 ký tự)'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    
    const formData = new FormData()
    formData.append('rating', rating)
    formData.append('comment', comment)

    const result = await onSubmit(formData)
    if (result.success) {
      setToast({ type: 'success', msg: result.message })
    } else {
      setToast({ type: 'error', msg: result.message })
    }
    setTimeout(() => setToast(null), 4000)
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
        <h2 className="font-black text-slate-900 text-sm uppercase tracking-tight flex items-center gap-2">
          <Edit3 size={15} className="text-blue-600" /> Đánh giá của bạn
        </h2>
      </div>
      <div className="p-6 space-y-6">

        {/* Toast */}
        {toast && (
          <div className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border text-sm font-semibold ${
            toast.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'
          }`}>
            {toast.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            {toast.msg}
          </div>
        )}

        {/* Rating */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-800">
            Đánh giá chung <span className="text-red-500">*</span>
          </label>
          <StarInput value={rating} onChange={setRating} />
          {errors.rating && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle size={11} />{errors.rating}</p>}
        </div>

        {/* Divider */}
        <div className="border-t border-slate-100" />

        {/* Content */}
        <div className="space-y-1.5">
          <label className="text-sm font-bold text-slate-800">
            Nội dung bình luận <span className="text-red-500">*</span>
          </label>
          <div className={`relative rounded-xl border bg-white transition-all ${errors.comment ? 'border-red-400' : 'border-slate-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100'}`}>
            <textarea
              rows={4} maxLength={1000}
              placeholder="Nhập nội dung bình luận của bạn về sản phẩm này..."
              className="w-full px-4 pt-3 pb-8 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 outline-none resize-none"
              value={comment} onChange={e => setComment(e.target.value)}
            />
            <span className="absolute right-3 bottom-2.5 text-xs text-slate-400">{comment.length}/1000</span>
          </div>
          {errors.comment && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle size={11} />{errors.comment}</p>}
        </div>

        {/* Submit */}
        <button
          type="submit" disabled={submitting}
          className="w-full h-12 rounded-xl bg-blue-600 text-white font-black text-sm shadow-[0_8px_24px_rgba(37,99,235,0.3)] hover:bg-blue-700 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {submitting
            ? <><Loader2 size={16} className="animate-spin" />Đang gửi...</>
            : <><CheckCircle2 size={16} />Gửi đánh giá</>
          }
        </button>
      </div>
    </form>
  )
}

/* ─── Rating stats overview ──────────────────────────────────── */
export function RatingOverview({ stats }) {
  const { avg_rating = 0, total = 0, breakdown = {} } = stats
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 mb-4">
      <div className="flex items-center gap-6">
        <div className="text-center shrink-0">
          <p className="text-5xl font-black text-slate-900">{Number(avg_rating).toFixed(1)}</p>
          <StarDisplay value={avg_rating} size={18} />
          <p className="text-xs text-slate-500 mt-1">{total} đánh giá</p>
        </div>
        <div className="flex-1 space-y-1.5">
          {[5, 4, 3, 2, 1].map(star => {
            const count = breakdown[star] || 0
            const pct = total > 0 ? Math.round((count / total) * 100) : 0
            return (
              <div key={star} className="flex items-center gap-2">
                <span className="text-xs text-slate-600 w-4 text-right shrink-0">{star}</span>
                <Star size={11} className="text-yellow-400 fill-yellow-400 shrink-0" />
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-400 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-xs text-slate-500 w-5 text-right shrink-0">{count}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/* ─── Single review card ─────────────────────────────────────── */
export function ReviewCard({ review }) {
  const { user } = useAuth()
  const commentStr = review.comment || ''
  const hasNewline = commentStr.includes('\n')
  
  let title = ''
  let body = commentStr
  
  if (hasNewline) {
    const parts = commentStr.split('\n')
    title = parts[0]
    body = parts.slice(1).join('\n').trim()
  }

  const [activeImage, setActiveImage] = useState(null)

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-sm transition-all">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white text-xs font-black shrink-0">
          {(review.user?.full_name || review.user?.username || '?').charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <p className="text-sm font-bold text-slate-900">{review.user?.full_name || review.user?.username}</p>
            <span className="text-xs text-slate-400 shrink-0">{review.review_date}</span>
          </div>
          <StarDisplay value={review.rating} size={13} />
          {title && <p className="font-bold text-slate-800 text-sm mt-2">{title}</p>}
          {body && <p className="text-sm text-slate-600 mt-1 leading-relaxed">{body}</p>}
          
          {/* Images Grid */}
          {review.images && review.images.length > 0 && (
            <div className="flex gap-2 flex-wrap mt-3">
              {review.images.map((url, i) => (
                <div key={i} className="w-16 h-16 rounded-lg overflow-hidden border border-slate-100 cursor-zoom-in hover:border-blue-400 active:scale-95 transition-all">
                  <img src={url} alt="" className="w-full h-full object-cover" onClick={() => setActiveImage(url)} />
                </div>
              ))}
            </div>
          )}

          {review.sentiment && (user?.is_staff || user?.is_superuser) && (
            <span className={`inline-flex items-center gap-1 mt-2.5 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
              review.sentiment === 'positive' ? 'bg-green-50 border-green-200 text-green-700' :
              review.sentiment === 'negative' ? 'bg-red-50 border-red-200 text-red-700' :
              'bg-slate-50 border-slate-200 text-slate-600'
            }`}>
              {review.sentiment === 'positive' ? (
                <>
                  <Smile size={11} className="shrink-0" />
                  <span>Tích cực</span>
                </>
              ) : review.sentiment === 'negative' ? (
                <>
                  <Frown size={11} className="shrink-0" />
                  <span>Tiêu cực</span>
                </>
              ) : (
                <>
                  <Meh size={11} className="shrink-0" />
                  <span>Trung lập</span>
                </>
              )}
            </span>
          )}
        </div>
      </div>

      {/* Lightbox Modal */}
      {activeImage && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" onClick={() => setActiveImage(null)}>
          <div className="relative max-w-3xl max-h-[80vh] bg-white rounded-2xl overflow-hidden shadow-2xl p-2" onClick={e => e.stopPropagation()}>
            <img src={activeImage} alt="Review zoom" className="max-w-full max-h-[75vh] object-contain rounded-lg" />
            <button className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-900/60 hover:bg-slate-900/80 text-white flex items-center justify-center transition-colors" onClick={() => setActiveImage(null)}>
              <X size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

/* ─── Right sidebar ──────────────────────────────────────────── */
export function ReviewSidebar() {
  return (
    <div className="space-y-4 lg:sticky lg:top-24">

      {/* Guidelines */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/60">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Hướng dẫn đánh giá</span>
        </div>
        <div className="p-4 space-y-4">
          {[
            { icon: Edit3, label: 'Viết đánh giá chân thực', sub: 'Chia sẻ trải nghiệm thực tế của bạn về sản phẩm.' },
            { icon: Lightbulb, label: 'Nội dung hữu ích', sub: 'Đánh giá có ích sẽ giúp nhiều người mua hàng hơn.' },
            { icon: Image, label: 'Hình ảnh rõ nét', sub: 'Hình ảnh thực tế giúp tăng độ tin cậy cho đánh giá.' },
          ].map(({ icon: Icon, label, sub }) => (
            <div key={label} className="flex gap-3 items-start">
              <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                <Icon size={14} className="text-blue-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">{label}</p>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Policy */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/60">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Chính sách đánh giá</span>
        </div>
        <div className="p-4 space-y-2.5">
          {[
            'Đánh giá phải liên quan đến sản phẩm đã mua.',
            'Không đăng nội dung quảng cáo, spam hoặc vi phạm pháp luật.',
            'LaptopDevice có quyền từ chối hiển thị những đánh giá không phù hợp.',
            'Mỗi đơn hàng chỉ được đánh giá 1 lần cho mỗi sản phẩm.',
          ].map(p => (
            <div key={p} className="flex gap-2 items-start">
              <Shield size={12} className="text-blue-500 mt-0.5 shrink-0" />
              <p className="text-[11px] text-slate-600 leading-relaxed">{p}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Support */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/60">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Bạn cần hỗ trợ?</span>
        </div>
        <div className="p-4 space-y-3">
          {[
            { icon: Phone, label: 'Hotline: 1900 1234', sub: '(8:00 – 21:00, tất cả các ngày)' },
            { icon: Mail, label: 'Email: support@laptopdevice.vn', sub: 'Phản hồi trong 30 phút' },
          ].map(({ icon: Icon, label, sub }) => (
            <div key={label} className="flex gap-3 items-start">
              <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
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
    </div>
  )
}

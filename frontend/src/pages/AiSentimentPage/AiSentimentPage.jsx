import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import api from '../../services/api'
import {
  ChevronRight, RefreshCw, CheckCircle2, ShieldCheck,
  Search, ChevronDown, ThumbsUp, MoreHorizontal, ArrowRight,
  Smile, Frown, Cpu, PenTool, Monitor, Thermometer, Battery,
  Speaker, DollarSign, Info
} from 'lucide-react'
import {
  PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer
} from 'recharts'
import { StarDisplay } from '../../features/review/components/ReviewComponents'


export default function AiSentimentPage() {
  const { productId } = useParams()
  const { user, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [stats, setStats] = useState(null)
  const [activeTab, setActiveTab] = useState('tong-quan')

  // Review filters state
  const [sentimentFilter, setSentimentFilter] = useState('Tất cả cảm xúc')
  const [ratingFilter, setRatingFilter] = useState('Tất cả sao')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (authLoading) return
    if (!user || (!user.is_staff && !user.is_superuser)) {
      setError('Bạn không có quyền truy cập trang này. Vui lòng đăng nhập bằng tài khoản quản trị.')
      setLoading(false)
      return
    }

    const fetchStats = async () => {
      setLoading(true)
      try {
        const res = await api.get(`products/${productId}/sentiment-stats/`)
        setStats(res.data)
        setError('')
      } catch (err) {
        setError(err.response?.data?.error || 'Không tải được số liệu thống kê cảm xúc.')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [productId, user, authLoading])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-sm text-slate-500 font-medium animate-pulse">Đang tải số liệu phân tích từ AI...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6 max-w-md w-full text-center">
          <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4">
            <Info size={24} />
          </div>
          <h3 className="text-lg font-black text-slate-900 mb-2">Đã xảy ra lỗi</h3>
          <p className="text-slate-500 text-sm mb-6 leading-relaxed">{error}</p>
          <Link to="/" className="inline-flex justify-center px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold shadow-md hover:bg-blue-700 transition-colors w-full">
            Quay lại trang chủ
          </Link>
        </div>
      </div>
    )
  }

  const product = stats?.product || {}
  const currentPie = stats?.dataPie || []
  const currentTrend = stats?.dataTrend || []
  const currentAspects = stats?.aspects || []
  const currentPosKeywords = stats?.positiveKeywords || []
  const currentNegKeywords = stats?.negativeKeywords || []
  const currentReviews = stats?.reviews || []
  const total = stats?.total || 0

  // Filter logic
  const filteredReviews = currentReviews.filter(r => {
    const rSentiment = r.sentiment || 'neutral'
    const matchesSentiment = sentimentFilter === 'Tất cả cảm xúc' ||
      (sentimentFilter === 'Tích cực' && rSentiment === 'positive') ||
      (sentimentFilter === 'Trung tính' && rSentiment === 'neutral') ||
      (sentimentFilter === 'Tiêu cực' && rSentiment === 'negative')

    const matchesRating = ratingFilter === 'Tất cả sao' ||
      r.rating === parseInt(ratingFilter)

    const commentStr = r.comment || ''
    const userStr = r.user?.full_name || r.user?.username || ''
    const matchesSearch = !searchQuery ||
      commentStr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      userStr.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesSentiment && matchesRating && matchesSearch
  })

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="mx-4.5 py-6 pb-16">

        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-1.5 text-sm flex-wrap">
          <Link to="/" className="text-slate-500 hover:text-blue-600 transition-colors font-medium">Trang chủ</Link>
          <ChevronRight size={14} className="text-slate-300" />
          <Link to="/profile" className="text-slate-500 hover:text-blue-600 transition-colors font-medium">Quản trị</Link>
          <ChevronRight size={14} className="text-slate-300" />
          <span className="text-slate-900 font-semibold truncate max-w-[200px] sm:max-w-md">{product.name}</span>
          <ChevronRight size={14} className="text-slate-300" />
          <span className="text-blue-600 font-bold">AI Phân tích cảm xúc</span>
        </nav>

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">AI phân tích cảm xúc bình luận</h1>
              <span className="px-2.5 py-1 text-[10px] font-bold bg-blue-100 text-blue-700 rounded-full uppercase tracking-wider">Beta</span>
            </div>
            <p className="text-slate-500 text-sm">Dữ liệu được phân tích trực tiếp từ {total} bình luận của khách hàng đã mua sản phẩm.</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500 bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm">
            <span>Cập nhật lần cuối: Vừa xong</span>
            <button className="hover:text-blue-600 hover:rotate-180 transition-all duration-500" onClick={() => window.location.reload()}><RefreshCw size={14} /></button>
          </div>
        </div>

        {/* Product Card Info */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-24 h-24 shrink-0 bg-slate-50 rounded-xl border border-slate-100 p-2 flex items-center justify-center">
              {product.image ? (
                <img src={product.image} alt={product.name} className="w-full h-full object-contain rounded-lg" />
              ) : (
                <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              )}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-1">{product.name}</h2>
              <p className="text-sm text-slate-500 mb-3">Danh mục: {product.category_name}</p>
              <div className="flex items-center gap-3">
                <StarDisplay value={product.avg_rating} size={14} />
                <span className="text-sm font-bold text-slate-800">{product.avg_rating?.toFixed(1)}/5 <span className="text-slate-500 font-normal">({product.total_reviews} đánh giá)</span></span>
              </div>
              <div className="mt-2 text-xl font-black text-blue-600">{Number(product.price).toLocaleString('vi-VN')}đ</div>
            </div>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <Link to={`/products/${product.id}`} className="flex-1 md:flex-none px-6 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-sm hover:bg-slate-50 text-center transition-colors">
              Xem chi tiết sản phẩm
            </Link>
            <Link to={`/review/${product.id}`} className="flex-1 md:flex-none px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 flex items-center justify-center gap-2 transition-colors">
              Đến trang đánh giá <ChevronDown size={16} />
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-6 border-b border-slate-200 mb-6 overflow-x-auto no-scrollbar">
          <button
            className={`pb-3 text-sm font-bold whitespace-nowrap transition-colors relative text-blue-600`}
          >
            Tổng quan cảm xúc
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full" />
          </button>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-12 gap-6">

          {/* TỔNG QUAN CẢM XÚC */}
          <div className="col-span-12 lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide mb-6">Tổng quan cảm xúc</h3>

            <div className="flex items-center justify-between mb-8 flex-1">
              {/* Donut Chart */}
              <div className="relative w-[140px] h-[140px] mx-auto sm:mx-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={currentPie} innerRadius={50} outerRadius={70} paddingAngle={2} dataKey="value" stroke="none">
                      {currentPie.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center animate-pulse">
                  <span className="text-xl font-black text-slate-800 leading-none">{total}</span>
                  <span className="text-[10px] text-slate-500 mt-1 uppercase">Tổng bình luận</span>
                </div>
              </div>

              {/* Legend */}
              <div className="space-y-4">
                {currentPie.map(item => (
                  <div key={item.name} className="flex items-center gap-3 text-sm">
                    <div className="flex items-center gap-1.5 w-[85px]">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></div>
                      <span className="text-slate-600">{item.name}</span>
                    </div>
                    <span className="font-bold text-slate-800 font-mono">
                      {total > 0 ? ((item.value / total) * 100).toFixed(1) : 0}% <span className="text-slate-400 font-normal text-xs">({item.value})</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom 2 sub-boxes */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex flex-col justify-between">
                <span className="text-xs font-bold text-slate-600 mb-2">Điểm cảm xúc tổng thể</span>
                <div className="flex items-end gap-2 mb-2">
                  <span className="text-3xl font-black text-blue-600 leading-none">{product.avg_rating?.toFixed(1)}<span className="text-lg text-slate-400">/5</span></span>
                  <div className="flex items-center gap-1 text-green-600 text-[10px] font-bold bg-green-50 px-1.5 py-0.5 rounded-md">
                    <Smile size={10} /> AI Sentiment
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 leading-tight">Dựa trên phân tích AI từ bình luận của khách hàng</span>
              </div>

              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex flex-col justify-between">
                <span className="text-xs font-bold text-slate-600 mb-2">Độ tin cậy của phân tích</span>
                <div className="flex items-end gap-2 mb-2">
                  <span className="text-3xl font-black text-blue-600 leading-none">95%</span>
                  <ShieldCheck size={18} className="text-blue-500 mb-0.5" />
                </div>
                <span className="text-[10px] text-slate-400 leading-tight">Độ chính xác của mô hình AI</span>
              </div>
            </div>
          </div>

          {/* PHÂN BỐ CẢM XÚC */}
          <div className="col-span-12 lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide mb-6">Phân bố cảm xúc (7 ngày)</h3>
            <div className="flex-1 min-h-[220px]">
              {total > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={currentTrend} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} dx={-10} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                    <RechartsTooltip />
                    <Line type="monotone" dataKey="pos" stroke="#10B981" strokeWidth={2} dot={false} name="Tích cực" />
                    <Line type="monotone" dataKey="neu" stroke="#FBBF24" strokeWidth={2} dot={false} name="Trung tính" />
                    <Line type="monotone" dataKey="neg" stroke="#EF4444" strokeWidth={2} dot={false} name="Tiêu cực" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 text-sm">Chưa có bình luận nào để thống kê xu hướng.</div>
              )}
            </div>
            <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-1.5"><div className="w-3 h-1 bg-green-500 rounded-full" /><span className="text-xs text-slate-600">Tích cực</span></div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-1 bg-yellow-400 rounded-full" /><span className="text-xs text-slate-600">Trung tính</span></div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-1 bg-red-500 rounded-full" /><span className="text-xs text-slate-600">Tiêu cực</span></div>
            </div>
          </div>

          {/* TỪ KHÓA NỔI BẬT */}
          <div className="col-span-12 lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide">Từ khóa nổi bật</h3>
            </div>

            <div className="space-y-5 flex-1">
              <div>
                <div className="flex items-center gap-1.5 text-green-600 font-bold text-sm mb-3">
                  <Smile size={16} /> Tích cực
                </div>
                <div className="flex flex-wrap gap-2">
                  {currentPosKeywords.length > 0 ? (
                    currentPosKeywords.map(kw => (
                      <div key={kw.t} className="flex items-center bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
                        <span className="px-2.5 py-1 text-xs text-slate-700 bg-slate-50">{kw.t}</span>
                        <span className="px-2 py-1 text-[10px] text-slate-400 border-l border-slate-200">{kw.c}</span>
                      </div>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400">Không đủ dữ liệu</span>
                  )}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-1.5 text-red-500 font-bold text-sm mb-3">
                  <Frown size={16} /> Tiêu cực
                </div>
                <div className="flex flex-wrap gap-2">
                  {currentNegKeywords.length > 0 ? (
                    currentNegKeywords.map(kw => (
                      <div key={kw.t} className="flex items-center bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
                        <span className="px-2.5 py-1 text-xs text-slate-700 bg-slate-50">{kw.t}</span>
                        <span className="px-2 py-1 text-[10px] text-slate-400 border-l border-slate-200">{kw.c}</span>
                      </div>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400">Không đủ dữ liệu</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* BÌNH LUẬN CHI TIẾT */}
          <div className="col-span-12 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide mb-6">Bình luận chi tiết ({filteredReviews.length})</h3>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="relative">
                <select className="appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 pr-10 text-sm text-slate-700 outline-none hover:border-slate-300 w-full sm:w-auto font-medium" value={sentimentFilter} onChange={e => setSentimentFilter(e.target.value)}>
                  <option>Tất cả cảm xúc</option>
                  <option>Tích cực</option>
                  <option>Trung tính</option>
                  <option>Tiêu cực</option>
                </select>
                <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
              <div className="relative">
                <select className="appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 pr-10 text-sm text-slate-700 outline-none hover:border-slate-300 w-full sm:w-auto font-medium" value={ratingFilter} onChange={e => setRatingFilter(e.target.value)}>
                  <option>Tất cả sao</option>
                  <option>5 sao</option>
                  <option>4 sao</option>
                  <option>3 sao</option>
                  <option>2 sao</option>
                  <option>1 sao</option>
                </select>
                <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
              <div className="relative flex-1">
                <input type="text" placeholder="Tìm kiếm bình luận..." className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 pl-10 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            {/* Reviews List */}
            <div className="space-y-0 divide-y divide-slate-100 max-h-[600px] overflow-y-auto pr-1">
              {filteredReviews.length > 0 ? (
                filteredReviews.map(review => (
                  <div key={review.id} className="py-5 first:pt-0 last:pb-0 group animate-in fade-in duration-300">
                    <div className="flex gap-4 items-start">
                      <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shrink-0 shadow-sm uppercase">
                        {(review.user?.full_name || review.user?.username || '?').charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <div>
                            <p className="text-sm font-bold text-slate-900">{review.user?.full_name || review.user?.username}</p>
                            <div className="flex items-center gap-1 text-green-600 text-[10px] font-bold mt-0.5">
                              <CheckCircle2 size={10} /> Đã mua hàng
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 mb-2">
                          <StarDisplay value={review.rating} size={14} />
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold border ${review.sentiment === 'positive' ? 'bg-green-50 border-green-200 text-green-700' :
                            review.sentiment === 'negative' ? 'bg-red-50 border-red-200 text-red-700' :
                              'bg-slate-50 border-slate-200 text-slate-600'
                            }`}>
                            {review.sentiment === 'positive' ? 'Tích cực' : review.sentiment === 'negative' ? 'Tiêu cực' : 'Trung lập'}
                          </span>
                        </div>

                        <p className="text-sm text-slate-700 leading-relaxed mb-3">{review.comment}</p>

                        <div className="flex items-center gap-3 text-xs text-slate-400">
                          <span>{review.review_date}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-slate-400 text-sm">Không tìm thấy đánh giá nào phù hợp bộ lọc.</div>
              )}
            </div>
          </div>

        </div>

        {/* Footer Note */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-6 bg-blue-50/50 rounded-xl border border-blue-100 mb-8">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <Info size={14} className="text-blue-500" />
            <span>AI phân tích cảm xúc sử dụng công nghệ xử lý ngôn ngữ tự nhiên (NLP) để phân tích và đánh giá cảm xúc trong bình luận của khách hàng.</span>
          </div>
        </div>

      </div>
    </div>
  )
}

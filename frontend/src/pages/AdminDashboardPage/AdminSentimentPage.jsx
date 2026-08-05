import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { 
  Smile, Frown, Meh, Search, ArrowRight, 
  TrendingUp, Info, Loader2, Star, CheckCircle, 
  AlertCircle, ShieldCheck, RefreshCw, BarChart2 
} from 'lucide-react'
import {
  PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, 
  CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer 
} from 'recharts'
import api from '../../services/api'
import { StarDisplay } from '../../features/review/components/ReviewComponents'

export default function AdminSentimentPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [stats, setStats] = useState(null)
  
  // Search and sorting
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('most_reviews') // most_reviews, highest_positive, highest_negative, highest_rating

  const fetchStats = async () => {
    setLoading(true)
    try {
      const res = await api.get('admin/sentiment-stats/')
      setStats(res.data)
      setError('')
    } catch (err) {
      setError(err.response?.data?.error || 'Không tải được số liệu phân tích cảm xúc hệ thống.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  // Filter & Sort products
  const processedProducts = useMemo(() => {
    if (!stats?.products) return []
    
    let list = [...stats.products]

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      list = list.filter(p => p.name.toLowerCase().includes(query))
    }

    // Sorting
    list.sort((a, b) => {
      if (sortBy === 'most_reviews') {
        return b.total_reviews - a.total_reviews
      }
      if (sortBy === 'highest_positive') {
        return b.positive_percent - a.positive_percent
      }
      if (sortBy === 'highest_negative') {
        return b.negative_percent - a.negative_percent
      }
      if (sortBy === 'highest_rating') {
        return b.avg_rating - a.avg_rating
      }
      return 0
    })

    return list
  }, [stats?.products, searchQuery, sortBy])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 min-h-[400px]">
        <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
        <p className="text-slate-500 text-sm font-semibold animate-pulse">Đang tổng hợp dữ liệu cảm xúc AI...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 text-red-700 rounded-2xl flex items-center gap-3 max-w-xl mx-auto my-12">
        <AlertCircle size={24} className="shrink-0" />
        <div>
          <h4 className="font-bold text-base mb-1">Đã xảy ra lỗi</h4>
          <p className="text-sm leading-relaxed">{error}</p>
        </div>
      </div>
    )
  }

  const totalReviews = stats?.total_reviews || 0
  const dataPie = stats?.dataPie || []
  const dataTrend = stats?.dataTrend || []
  
  // Calculate aggregate metrics
  const positiveItem = dataPie.find(item => item.name === 'Tích cực')
  const negativeItem = dataPie.find(item => item.name === 'Tiêu cực')
  
  const overallPositivePercent = totalReviews > 0 && positiveItem 
    ? Math.round((positiveItem.value / totalReviews) * 100) 
    : 0
    
  const overallNegativePercent = totalReviews > 0 && negativeItem 
    ? Math.round((negativeItem.value / totalReviews) * 100) 
    : 0

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">Thống kê Cảm xúc AI toàn sàn</h1>
            <span className="px-2.5 py-0.5 text-[10px] font-bold bg-blue-100 text-blue-700 rounded-full uppercase tracking-wider">Hệ thống</span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Tổng quan cảm xúc phản hồi từ tất cả bình luận sản phẩm của khách hàng qua mô hình ngôn ngữ tự nhiên AI.
          </p>
        </div>
        <button 
          onClick={fetchStats}
          className="flex items-center gap-2 px-4 py-2 border border-slate-200 hover:bg-slate-50 hover:border-slate-350 text-slate-700 bg-white rounded-xl text-sm font-semibold shadow-sm transition-all"
        >
          <RefreshCw size={14} className="text-slate-500" />
          <span>Làm mới</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Card 1: Total Reviews */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Tổng bình luận đã duyệt</p>
            <h3 className="text-3xl font-black text-slate-800">{totalReviews.toLocaleString('vi-VN')}</h3>
            <p className="text-[10px] text-slate-400">Không bao gồm các bình luận spam</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <BarChart2 size={24} />
          </div>
        </div>

        {/* Card 2: Positive Sentiment */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Chỉ số hài lòng tích cực</p>
            <div className="flex items-baseline gap-1.5">
              <h3 className="text-3xl font-black text-green-600">{overallPositivePercent}%</h3>
              <span className="text-xs text-slate-400 font-medium">({positiveItem?.value || 0} reviews)</span>
            </div>
            <p className="text-[10px] text-slate-400">Tỷ lệ đánh giá mang xu hướng tích cực</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center">
            <Smile size={24} />
          </div>
        </div>

        {/* Card 3: Model Accuracy */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Độ tin cậy của AI</p>
            <h3 className="text-3xl font-black text-indigo-600">95.0%</h3>
            <p className="text-[10px] text-slate-400">Độ chính xác của mô hình DistilPhoBERT</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <ShieldCheck size={24} />
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Pie/Donut Chart */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-2">Phân bố cảm xúc toàn sàn</h3>
            <p className="text-xs text-slate-400">Tỷ lệ các nhóm cảm xúc chính.</p>
          </div>

          <div className="flex items-center justify-between my-6 flex-1">
            {/* Recharts Donut */}
            <div className="relative w-[150px] h-[150px] mx-auto sm:mx-0 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={dataPie} innerRadius={55} outerRadius={73} paddingAngle={2} dataKey="value" stroke="none">
                    {dataPie.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                <span className="text-2xl font-black text-slate-800 leading-none">{totalReviews}</span>
                <span className="text-[9px] text-slate-400 mt-1 uppercase tracking-wider">Đánh giá</span>
              </div>
            </div>

            {/* Legend */}
            <div className="space-y-3.5 pl-4 flex-1">
              {dataPie.map(item => (
                <div key={item.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="text-slate-650 font-medium">{item.name}</span>
                  </div>
                  <span className="font-bold text-slate-800 font-mono">
                    {totalReviews > 0 ? ((item.value / totalReviews) * 100).toFixed(1) : 0}% 
                    <span className="text-slate-400 font-normal ml-1">({item.value})</span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 flex gap-2 items-start text-xs text-slate-500">
            <Info size={16} className="text-blue-500 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Cảm xúc được đánh giá dựa trên từ khóa, ngữ cảnh đánh giá và giọng điệu bình luận của khách hàng.
            </p>
          </div>
        </div>

        {/* Trend Area/Line Chart */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-1">Xu hướng cảm xúc (7 ngày qua)</h3>
              <p className="text-xs text-slate-400">Biến động tỷ lệ cảm xúc hàng ngày.</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-lg">
              <TrendingUp size={14} />
              <span>Thời gian thực</span>
            </div>
          </div>

          <div className="flex-1 min-h-[220px]">
            {totalReviews > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dataTrend} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} dx={-10} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                  <RechartsTooltip />
                  <Line type="monotone" dataKey="pos" stroke="#10B981" strokeWidth={3} dot={{ strokeWidth: 1, r: 2 }} name="Tích cực" />
                  <Line type="monotone" dataKey="neu" stroke="#FBBF24" strokeWidth={3} dot={{ strokeWidth: 1, r: 2 }} name="Trung tính" />
                  <Line type="monotone" dataKey="neg" stroke="#EF4444" strokeWidth={3} dot={{ strokeWidth: 1, r: 2 }} name="Tiêu cực" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">Chưa có bình luận nào để thống kê xu hướng.</div>
            )}
          </div>

          <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-1.5"><div className="w-3 h-1 bg-green-500 rounded-full" /><span className="text-xs text-slate-650 font-medium">Tích cực</span></div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-1 bg-yellow-400 rounded-full" /><span className="text-xs text-slate-650 font-medium">Trung tính</span></div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-1 bg-red-500 rounded-full" /><span className="text-xs text-slate-650 font-medium">Tiêu cực</span></div>
          </div>
        </div>
      </div>

      {/* Product List Leaderboard */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-base font-black text-slate-800">Xếp hạng cảm xúc sản phẩm</h3>
            <p className="text-xs text-slate-400 mt-1">Danh sách sản phẩm và tỷ lệ cảm xúc phân tích từ bình luận.</p>
          </div>

          {/* Search and Sort controls */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative max-w-xs">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Tìm kiếm sản phẩm..." 
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:bg-white focus:border-blue-500 transition-all"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="relative">
              <select 
                className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-700 outline-none hover:bg-slate-100 transition-all font-semibold"
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
              >
                <option value="most_reviews">Đánh giá nhiều nhất</option>
                <option value="highest_positive">Cảm xúc tích cực (%)</option>
                <option value="highest_negative">Cảm xúc tiêu cực (%)</option>
                <option value="highest_rating">Rating trung bình</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto -mx-6">
          <table className="w-full text-left border-collapse whitespace-nowrap min-w-[800px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-black text-slate-500 uppercase tracking-wider">
                <th className="py-4 px-6">Sản phẩm</th>
                <th className="py-4 px-6 text-center">Tổng đánh giá</th>
                <th className="py-4 px-6 text-center">Rating trung bình</th>
                <th className="py-4 px-6">Tỉ lệ cảm xúc (% Tích cực / % Trung lập / % Tiêu cực)</th>
                <th className="py-4 px-6 text-right">Chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {processedProducts.length > 0 ? (
                processedProducts.map((prod) => (
                  <tr key={prod.id} className="hover:bg-slate-50/50 transition-colors">
                    {/* Product cell */}
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-lg p-1.5 flex items-center justify-center shrink-0">
                          {prod.image ? (
                            <img src={prod.image} alt={prod.name} className="w-full h-full object-contain" />
                          ) : (
                            <svg className="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          )}
                        </div>
                        <span className="font-bold text-slate-800 text-sm max-w-sm truncate" title={prod.name}>
                          {prod.name}
                        </span>
                      </div>
                    </td>

                    {/* Total reviews */}
                    <td className="py-3.5 px-6 text-center">
                      <span className="font-bold text-slate-700 text-sm">{prod.total_reviews}</span>
                    </td>

                    {/* Rating */}
                    <td className="py-3.5 px-6 text-center">
                      <div className="inline-flex items-center gap-1.5">
                        <span className="font-bold text-slate-800 text-sm">{prod.avg_rating.toFixed(1)}</span>
                        <Star size={14} className="fill-amber-400 stroke-amber-400" />
                      </div>
                    </td>

                    {/* Sentiment distributions progress bar */}
                    <td className="py-3.5 px-6 min-w-[320px]">
                      <div className="space-y-1.5 max-w-md">
                        {/* Segmented Progress Bar */}
                        <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
                          {prod.positive_percent > 0 && (
                            <div 
                              className="h-full bg-gradient-to-r from-emerald-500 to-green-500" 
                              style={{ width: `${prod.positive_percent}%` }}
                              title={`Tích cực: ${prod.positive_percent}%`}
                            />
                          )}
                          {prod.neutral_percent > 0 && (
                            <div 
                              className="h-full bg-yellow-400" 
                              style={{ width: `${prod.neutral_percent}%` }}
                              title={`Trung lập: ${prod.neutral_percent}%`}
                            />
                          )}
                          {prod.negative_percent > 0 && (
                            <div 
                              className="h-full bg-red-500" 
                              style={{ width: `${prod.negative_percent}%` }}
                              title={`Tiêu cực: ${prod.negative_percent}%`}
                            />
                          )}
                        </div>

                        {/* Percent breakdown Labels */}
                        <div className="flex justify-between items-center text-[10px] font-bold">
                          <span className="text-green-600 font-mono">{prod.positive_percent}% Tích cực</span>
                          <span className="text-yellow-600 font-mono">{prod.neutral_percent}% Trung lập</span>
                          <span className="text-red-500 font-mono">{prod.negative_percent}% Tiêu cực</span>
                        </div>
                      </div>
                    </td>

                    {/* Detail link */}
                    <td className="py-3.5 px-6 text-right">
                      <Link 
                        to={`/ai-sentiment/${prod.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs text-blue-600 hover:text-white bg-blue-50 hover:bg-blue-600 rounded-lg font-bold transition-all shadow-sm"
                      >
                        <span>Chi tiết AI</span>
                        <ArrowRight size={12} />
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-400 font-semibold">
                    Không tìm thấy sản phẩm nào có đánh giá phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts'
import { 
  DollarSign, ShoppingBag, TrendingUp, CreditCard, 
  Loader2, Info, ArrowLeft, ArrowUpRight
} from 'lucide-react'
import { Link } from 'react-router-dom'
import api from '../../services/api'

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#EC4899', '#6366F1']

export default function AdminRevenuePage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchRevenueStats = async () => {
      setLoading(true)
      try {
        const res = await api.get('admin/revenue-stats/')
        setData(res.data)
        setError('')
      } catch (err) {
        setError(err.response?.data?.error || 'Không tải được báo cáo doanh thu.')
      } finally {
        setLoading(false)
      }
    }
    fetchRevenueStats()
  }, [])

  const fPrice = (price) => {
    return Number(price).toLocaleString('vi-VN') + ' đ'
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 min-h-[60vh]">
        <Loader2 className="animate-spin text-blue-600 mb-3" size={36} />
        <p className="text-slate-500 font-bold text-sm">Đang tải báo cáo doanh thu...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 text-red-700 rounded-2xl flex items-center gap-3">
        <Info size={20} />
        <p className="font-semibold">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-slate-500 mb-1">
            <Link to="/admin" className="hover:text-blue-600 transition-colors flex items-center gap-1 text-xs font-semibold">
              <ArrowLeft size={14} /> Tổng quan
            </Link>
          </div>
          <h1 className="text-2xl font-black text-slate-800">Báo cáo doanh thu chi tiết</h1>
          <p className="text-sm text-slate-500 mt-1">Phân tích chuyên sâu về tình hình bán hàng, hiệu suất doanh thu và cơ cấu sản phẩm.</p>
        </div>
      </div>

      {/* Mini Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Total Revenue */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex items-center gap-4 relative overflow-hidden group">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <DollarSign size={24} />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 block mb-1 uppercase tracking-wider">Tổng doanh thu thực tế</span>
            <span className="text-lg font-black text-slate-800 block leading-tight">{fPrice(data.total_revenue)}</span>
          </div>
        </div>

        {/* Successful Orders */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex items-center gap-4 relative overflow-hidden group">
          <div className="w-12 h-12 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <ShoppingBag size={24} />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 block mb-1 uppercase tracking-wider">Đơn hàng hoàn tất</span>
            <span className="text-lg font-black text-slate-800 block leading-tight">{data.successful_orders} đơn</span>
          </div>
        </div>

        {/* AOV */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex items-center gap-4 relative overflow-hidden group">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <TrendingUp size={24} />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 block mb-1 uppercase tracking-wider">Trung bình đơn hàng</span>
            <span className="text-lg font-black text-slate-800 block leading-tight">{fPrice(data.aov)}</span>
          </div>
        </div>

        {/* Pending Revenue */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex items-center gap-4 relative overflow-hidden group">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <CreditCard size={24} />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 block mb-1 uppercase tracking-wider">Doanh thu chờ xử lý</span>
            <span className="text-lg font-black text-slate-800 block leading-tight">{fPrice(data.pending_revenue)}</span>
          </div>
        </div>

      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Trend Area Chart */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-2">
            <h3 className="font-bold text-slate-800 text-sm">Biến động doanh thu (30 ngày qua)</h3>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.daily_revenue} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} />
                <Tooltip 
                  formatter={(value) => [fPrice(value), 'Doanh thu']}
                  contentStyle={{ backgroundColor: '#1E293B', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Pie Chart */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-3 mb-4">Doanh thu theo danh mục</h3>
            <div className="h-60 w-full flex items-center justify-center relative">
              {data.category_distribution && data.category_distribution.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.category_distribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {data.category_distribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [fPrice(value), 'Doanh thu']} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-slate-400 text-xs font-semibold">Không có dữ liệu đóng góp danh mục.</div>
              )}
            </div>
          </div>
          
          {/* Legend */}
          <div className="space-y-1.5 mt-4">
            {data.category_distribution && data.category_distribution.slice(0, 4).map((entry, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs font-semibold text-slate-600">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                  <span className="truncate max-w-[140px]">{entry.name}</span>
                </div>
                <span>{fPrice(entry.value)}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Top Transactions Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-slate-800 text-sm">Top 5 đơn hàng giá trị cao nhất</h3>
          <Link to="/admin/orders" className="text-xs text-blue-600 hover:underline font-bold flex items-center gap-0.5">
            Quản lý tất cả đơn hàng <ArrowUpRight size={14} />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-4 px-6">Mã đơn hàng</th>
                <th className="py-4 px-6">Khách hàng</th>
                <th className="py-4 px-6">Số điện thoại</th>
                <th className="py-4 px-6">Thời gian</th>
                <th className="py-4 px-6 text-right">Giá trị đơn</th>
                <th className="py-4 px-6 text-center">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.top_orders && data.top_orders.length > 0 ? (
                data.top_orders.map((order, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-6 font-bold text-slate-800 text-sm">{order.id}</td>
                    <td className="py-3 px-6 text-sm text-slate-700 font-semibold">{order.customer}</td>
                    <td className="py-3 px-6 text-sm text-slate-650">{order.phone}</td>
                    <td className="py-3 px-6 text-sm text-slate-500">{order.date}</td>
                    <td className="py-3 px-6 text-sm text-right font-black text-blue-600">{order.amount_str}</td>
                    <td className="py-3 px-6 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-50 text-green-700 border border-green-200">
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-400 font-bold">Chưa có đơn hàng nào được ghi nhận.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}

import { useState, useEffect } from 'react'
import { 
  DollarSign, ShoppingCart, Users, Package,
  ArrowUpRight, ArrowDownRight, Eye, Loader2, Info
} from 'lucide-react'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts'
import api from '../../services/api'
import { Link } from 'react-router-dom'

// Local helper icons
function FileTextIcon(props) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
}
function MessageSquareIcon(props) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
}
function TicketIcon(props) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v14"/><path d="M13 9h.01"/><path d="M13 15h.01"/></svg>
}
function ShieldAlertIcon(props) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
}

export default function AdminDashboardPage() {
  const [days, setDays] = useState(7)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true)
      try {
        const res = await api.get('admin/dashboard-stats/', { params: { days } })
        setData(res.data)
        setError('')
      } catch (err) {
        setError(err.response?.data?.error || 'Không tải được báo cáo thống kê.')
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [days])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 min-h-[60vh]">
        <Loader2 className="animate-spin text-blue-600 mb-3" size={36} />
        <p className="text-slate-500 font-bold text-sm">Đang đồng bộ dữ liệu từ hệ thống...</p>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 text-red-700 rounded-3xl flex items-center gap-3">
        <Info size={24} />
        <div>
          <h4 className="font-bold text-lg">Lỗi đồng bộ dữ liệu</h4>
          <p className="text-sm font-semibold">{error || 'Có lỗi xảy ra.'}</p>
        </div>
      </div>
    )
  }

  const { stat_cards, sparkline_data, revenue_data, order_rate_data, recent_orders, top_products, mini_stats } = data

  // Stat card icon mapper
  const cardConfig = [
    { icon: DollarSign, color: 'text-green-600', bg: 'bg-green-100', trendColor: 'text-green-500' },
    { icon: ShoppingCart, color: 'text-purple-600', bg: 'bg-purple-100', trendColor: 'text-green-500' },
    { icon: Users, color: 'text-blue-600', bg: 'bg-blue-100', trendColor: 'text-green-500' },
    { icon: Package, color: 'text-orange-600', bg: 'bg-orange-100', trendColor: 'text-green-500' },
  ]

  // Mini stats icon mapper
  const miniConfigs = [
    { icon: Users, bg: 'bg-purple-100', color: 'text-purple-600' },
    { icon: TicketIcon, bg: 'bg-blue-100', color: 'text-blue-600' },
    { icon: MessageSquareIcon, bg: 'bg-green-100', color: 'text-green-600' },
    { icon: ShieldAlertIcon, bg: 'bg-orange-100', color: 'text-orange-600' },
  ]

  // Simulated notifications list (or we can pull from recent orders + actions)
  const notifications = [
    { title: recent_orders[0] ? `Đơn hàng ${recent_orders[0].id} vừa được tạo` : 'Có đơn hàng mới chờ xử lý', time: 'Mới đây', icon: ShoppingCart, color: 'text-purple-600', bg: 'bg-purple-100' },
    { title: top_products[0] ? `Sản phẩm "${top_products[0].name}" bán chạy nhất` : 'Có sản phẩm mới được bán', time: 'Hôm nay', icon: Package, color: 'text-blue-600', bg: 'bg-blue-100' },
    { title: `Đang có ${mini_stats[3]?.value || 0} bình luận bị đánh dấu spam`, time: 'Hệ thống AI', icon: ShieldAlertIcon, color: 'text-red-600', bg: 'bg-red-100' },
    { title: `Tổng số ${mini_stats[1]?.value || 0} mã giảm giá đang hoạt động`, time: 'Khuyến mãi', icon: TicketIcon, color: 'text-yellow-600', bg: 'bg-yellow-100' },
  ]

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      
      {/* ─── 4 Top Stat Cards ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {stat_cards.map((stat, idx) => {
          const cfg = cardConfig[idx] || cardConfig[0]
          return (
            <div key={idx} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm relative overflow-hidden group flex flex-col h-full">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-sm font-bold text-slate-800">{stat.title}</p>
                  <div className="flex items-center flex-wrap gap-x-1 text-[11px] mt-1">
                    <span className={`font-bold flex items-center ${stat.isUp ? 'text-green-500' : 'text-red-500'}`}>
                      {stat.isUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                      {stat.trend}
                    </span>
                    <span className="text-slate-400 whitespace-nowrap">so với tháng trước</span>
                  </div>
                </div>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${cfg.bg} ${cfg.color}`}>
                  <cfg.icon size={20} />
                </div>
              </div>
              <h3 className="text-[22px] lg:text-2xl font-black text-slate-800 mb-8 z-10 relative whitespace-nowrap tracking-tight">{stat.value}</h3>
              
              <div className="absolute bottom-0 left-0 w-full h-16">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={sparkline_data[idx]} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id={`colorSparkline${idx}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={stat.hex} stopOpacity={0.2} />
                        <stop offset="95%" stopColor={stat.hex} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="val" stroke={stat.hex} fill={`url(#colorSparkline${idx})`} strokeWidth={2} isAnimationActive={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )
        })}
      </div>

      {/* ─── Main Charts Row ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Revenue Chart */}
        <div className="col-span-12 xl:col-span-6 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm min-w-0">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-800">Doanh thu {days} ngày qua</h3>
            <select 
              className="bg-slate-50 border border-slate-200 text-slate-600 text-xs rounded-lg px-3 py-1.5 outline-none font-bold cursor-pointer"
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
            >
              <option value={7}>7 ngày qua</option>
              <option value={30}>30 ngày qua</option>
            </select>
          </div>
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenue_data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748B' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748B' }} tickFormatter={(val) => `${val}M`} />
                <Tooltip 
                  cursor={{ fill: '#F1F5F9' }} 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" fill="#4F46E5" radius={[4, 4, 0, 0]} maxBarSize={40}>
                  {
                    revenue_data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill="url(#colorUv)" />
                    ))
                  }
                </Bar>
                <defs>
                  <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366F1" stopOpacity={1}/>
                    <stop offset="100%" stopColor="#818CF8" stopOpacity={0.8}/>
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Order Rate Chart */}
        <div className="col-span-12 md:col-span-6 xl:col-span-3 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm min-w-0">
          <h3 className="font-bold text-slate-800 mb-2">Tỷ lệ đơn hàng</h3>
          <div className="h-[180px] w-full relative mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={order_rate_data}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  {order_rate_data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-black text-slate-800 leading-none">{stat_cards[1]?.value || 0}</span>
              <span className="text-[10px] font-bold text-slate-400 mt-1 uppercase">Tổng đơn</span>
            </div>
          </div>
          {/* Legend */}
          <div className="space-y-2 max-h-[140px] overflow-y-auto custom-scrollbar">
            {order_rate_data.map((item, idx) => {
              const total = order_rate_data.reduce((acc, curr) => acc + curr.value, 0)
              const percent = total > 0 ? ((item.value / total) * 100).toFixed(1) : '0.0'
              return (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-slate-600 font-medium">{item.name}</span>
                  </div>
                  <div className="text-slate-500">
                    <span className="font-bold text-slate-800 mr-1">{item.value}</span>
                    ({percent}%)
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Notifications */}
        <div className="col-span-12 md:col-span-6 xl:col-span-3 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col min-w-0">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800">Thông báo</h3>
            <button className="text-xs text-blue-600 hover:underline">Xem tất cả</button>
          </div>
          <div className="flex-1 space-y-4 overflow-y-auto custom-scrollbar pr-1 -mr-2 max-h-[300px]">
            {notifications.map((noti, idx) => (
              <div key={idx} className="flex gap-3 items-start">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${noti.bg} ${noti.color}`}>
                  <noti.icon size={14} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-slate-700 leading-snug mb-0.5 break-words">{noti.title}</p>
                  <p className="text-[10px] text-slate-400">{noti.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Bottom Row: Tables ─── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Latest Orders Table */}
        <div className="xl:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm overflow-hidden flex flex-col min-w-0">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800">Đơn hàng mới nhất</h3>
            <Link to="/admin/orders" className="text-xs text-blue-600 hover:underline">Xem tất cả</Link>
          </div>
          <div className="overflow-x-auto -mx-5 px-5">
            <table className="w-full text-left border-collapse whitespace-nowrap min-w-[650px]">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <th className="pb-3 pr-4 font-bold">Mã đơn</th>
                  <th className="pb-3 px-4 font-bold">Khách hàng</th>
                  <th className="pb-3 px-4 font-bold">Tổng tiền</th>
                  <th className="pb-3 px-4 font-bold">Thanh toán</th>
                  <th className="pb-3 px-4 font-bold">Trạng thái</th>
                  <th className="pb-3 px-4 font-bold">Ngày đặt</th>
                  <th className="pb-3 pl-4 text-center font-bold">Chi tiết</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-slate-100">
                {recent_orders.map((order, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 pr-4 font-bold text-blue-600">
                      <Link to="/admin/orders" className="hover:underline">{order.id}</Link>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-700">{order.customer}</td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{order.total}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-md text-[11px] font-bold ${order.pColor}`}>{order.payment}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-md text-[11px] font-bold ${order.sColor}`}>{order.status}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-500">{order.date}</td>
                    <td className="py-3 pl-4 text-center">
                      <Link to="/admin/orders" className="inline-block p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Eye size={16} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Products */}
        <div className="xl:col-span-1 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm min-w-0">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800">Top sản phẩm bán chạy</h3>
            <Link to="/admin/products" className="text-xs text-blue-600 hover:underline">Xem tất cả</Link>
          </div>
          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
            {top_products.length > 0 ? (
              top_products.map((prod) => (
                <div key={prod.id} className="flex items-center gap-4">
                  <span className="text-sm font-black text-slate-400 w-4 text-center">{prod.id}</span>
                  <div className="w-10 h-10 rounded-lg border border-slate-100 overflow-hidden shrink-0">
                    <img src={prod.img} alt={prod.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate mb-1" title={prod.name}>{prod.name}</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${prod.percent}%` }} />
                      </div>
                      <span className="text-[10px] text-slate-500 font-medium whitespace-nowrap">{prod.sales}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-slate-800">{prod.total}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-6 text-center text-slate-400 text-sm font-medium">Chưa có dữ liệu bán chạy.</div>
            )}
          </div>
        </div>
      </div>

      {/* ─── 4 Bottom Mini Cards ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mt-2">
        {mini_stats.map((stat, idx) => {
          const cfg = miniConfigs[idx] || miniConfigs[0]
          return (
            <div key={idx} className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-4 shadow-sm min-w-0">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${cfg.bg} ${cfg.color}`}>
                <cfg.icon size={20} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-500 mb-0.5 truncate">{stat.title}</p>
                <h4 className="text-lg font-black text-slate-800 leading-tight">{stat.value}</h4>
                <p className="text-[10px] font-bold text-green-500 mt-1 truncate">
                  {stat.trend} <span className="text-slate-400 font-medium">so với tháng trước</span>
                </p>
              </div>
            </div>
          )
        })}
      </div>

    </div>
  )
}

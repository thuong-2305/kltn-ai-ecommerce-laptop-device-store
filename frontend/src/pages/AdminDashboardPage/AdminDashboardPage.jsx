import { 
  DollarSign, ShoppingCart, Users, Package,
  ArrowUpRight, ArrowDownRight, Eye
} from 'lucide-react'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts'

const STAT_CARDS = [
  { title: 'Tổng doanh thu', value: '1.248.500.000 đ', trend: '+12.5%', isUp: true, icon: DollarSign, color: 'text-green-600', bg: 'bg-green-100', trendColor: 'text-green-500', hex: '#10B981' },
  { title: 'Đơn hàng', value: '2.845', trend: '+8.1%', isUp: true, icon: ShoppingCart, color: 'text-purple-600', bg: 'bg-purple-100', trendColor: 'text-green-500', hex: '#8B5CF6' },
  { title: 'Khách hàng', value: '12.450', trend: '+15.3%', isUp: true, icon: Users, color: 'text-blue-600', bg: 'bg-blue-100', trendColor: 'text-green-500', hex: '#3B82F6' },
  { title: 'Sản phẩm', value: '532', trend: '+7.4%', isUp: true, icon: Package, color: 'text-orange-600', bg: 'bg-orange-100', trendColor: 'text-green-500', hex: '#F97316' },
]

const SPARKLINE_DATA = [
  [ { val: 20 }, { val: 30 }, { val: 25 }, { val: 40 }, { val: 35 }, { val: 50 }, { val: 45 }, { val: 60 }, { val: 55 }, { val: 70 } ],
  [ { val: 10 }, { val: 20 }, { val: 15 }, { val: 30 }, { val: 25 }, { val: 40 }, { val: 35 }, { val: 50 }, { val: 45 }, { val: 55 } ],
  [ { val: 40 }, { val: 35 }, { val: 50 }, { val: 45 }, { val: 60 }, { val: 55 }, { val: 70 }, { val: 65 }, { val: 80 }, { val: 75 } ],
  [ { val: 30 }, { val: 25 }, { val: 40 }, { val: 35 }, { val: 50 }, { val: 45 }, { val: 60 }, { val: 55 }, { val: 70 }, { val: 65 } ]
]

const MINI_STATS = [
  { title: 'Tổng người dùng', value: '12.450', trend: '+15.3%', icon: Users, bg: 'bg-purple-100', color: 'text-purple-600' },
  { title: 'Bài viết', value: '156', trend: '+7.8%', icon: FileTextIcon, bg: 'bg-blue-100', color: 'text-blue-600' },
  { title: 'Bình luận', value: '2.345', trend: '+5.3%', icon: MessageSquareIcon, bg: 'bg-green-100', color: 'text-green-600' },
  { title: 'Đánh giá sản phẩm', value: '1.234', trend: '+12.1%', icon: StarIcon, bg: 'bg-orange-100', color: 'text-orange-600' },
]

// Mock component icons for MINI_STATS since lucide icons might need individual import
function FileTextIcon(props) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
}
function MessageSquareIcon(props) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
}
function StarIcon(props) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
}


const REVENUE_DATA = [
  { date: '17/05', value: 160 },
  { date: '18/05', value: 125 },
  { date: '19/05', value: 165 },
  { date: '20/05', value: 200 },
  { date: '21/05', value: 140 },
  { date: '22/05', value: 240 },
  { date: '23/05', value: 130 },
]

const ORDER_RATE_DATA = [
  { name: 'Đã giao hàng', value: 1562, color: '#10B981' }, // Green
  { name: 'Đang giao', value: 842, color: '#3B82F6' },    // Blue
  { name: 'Chờ xác nhận', value: 321, color: '#F59E0B' }, // Yellow
  { name: 'Đã hủy', value: 120, color: '#EF4444' },       // Red
]

const RECENT_ORDERS = [
  { id: '#TZ1056', customer: 'Nguyễn Văn A', total: '32.990.000 đ', payment: 'Đã thanh toán', pColor: 'text-green-600 bg-green-50', status: 'Đang giao', sColor: 'text-blue-600 bg-blue-50', date: '23/05/2025 14:23' },
  { id: '#TZ1055', customer: 'Trần Thị B', total: '18.490.000 đ', payment: 'Đã thanh toán', pColor: 'text-green-600 bg-green-50', status: 'Đã giao', sColor: 'text-green-600 bg-green-50', date: '23/05/2025 13:15' },
  { id: '#TZ1054', customer: 'Lê Văn C', total: '45.990.000 đ', payment: 'Chưa thanh toán', pColor: 'text-yellow-600 bg-yellow-50', status: 'Chờ xác nhận', sColor: 'text-yellow-600 bg-yellow-50', date: '23/05/2025 11:48' },
  { id: '#TZ1053', customer: 'Phạm Quốc D', total: '22.990.000 đ', payment: 'Đã thanh toán', pColor: 'text-green-600 bg-green-50', status: 'Đang giao', sColor: 'text-blue-600 bg-blue-50', date: '22/05/2025 16:30' },
  { id: '#TZ1052', customer: 'Hoàng Minh E', total: '9.990.000 đ', payment: 'Đã thanh toán', pColor: 'text-green-600 bg-green-50', status: 'Đã hủy', sColor: 'text-red-600 bg-red-50', date: '22/05/2025 10:05' },
]

const TOP_PRODUCTS = [
  { id: 1, name: 'Laptop ASUS ROG Strix G16', sales: '320 sản phẩm', total: '1.248.000.000 đ', percent: 100, img: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=50&h=50&fit=crop' },
  { id: 2, name: 'Laptop Acer Nitro 5', sales: '280 sản phẩm', total: '896.000.000 đ', percent: 75, img: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=50&h=50&fit=crop' },
  { id: 3, name: 'MacBook Air M2', sales: '210 sản phẩm', total: '795.000.000 đ', percent: 65, img: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=50&h=50&fit=crop' },
  { id: 4, name: 'Dell Inspiron 3520', sales: '190 sản phẩm', total: '456.000.000 đ', percent: 45, img: 'https://images.unsplash.com/photo-1593642702821-c823b13eb295?w=50&h=50&fit=crop' },
  { id: 5, name: 'HP Victus 15', sales: '160 sản phẩm', total: '384.000.000 đ', percent: 35, img: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=50&h=50&fit=crop' },
]

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      
      {/* ─── 4 Top Stat Cards ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {STAT_CARDS.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm relative overflow-hidden group flex flex-col h-full">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-sm font-bold text-slate-800">{stat.title}</p>
                <div className="flex items-center flex-wrap gap-x-1 text-[11px] mt-1">
                  <span className={`font-bold flex items-center ${stat.trendColor}`}>
                    {stat.isUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                    {stat.trend}
                  </span>
                  <span className="text-slate-400 whitespace-nowrap">so với tháng trước</span>
                </div>
              </div>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${stat.bg} ${stat.color}`}>
                <stat.icon size={20} />
              </div>
            </div>
            <h3 className="text-[22px] lg:text-2xl font-black text-slate-800 mb-8 z-10 relative whitespace-nowrap tracking-tight">{stat.value}</h3>
            
            <div className="absolute bottom-0 left-0 w-full h-16">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={SPARKLINE_DATA[idx]} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
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
        ))}
      </div>

      {/* ─── Main Charts Row ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Revenue Chart */}
        <div className="lg:col-span-6 xl:col-span-7 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-800">Doanh thu 7 ngày qua</h3>
            <select className="bg-slate-50 border border-slate-200 text-slate-600 text-xs rounded-lg px-3 py-1.5 outline-none">
              <option>7 ngày</option>
              <option>30 ngày</option>
            </select>
          </div>
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={REVENUE_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748B' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748B' }} tickFormatter={(val) => `${val}M`} />
                <Tooltip 
                  cursor={{ fill: '#F1F5F9' }} 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" fill="#4F46E5" radius={[4, 4, 0, 0]} maxBarSize={40}>
                  {
                    REVENUE_DATA.map((entry, index) => (
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
        <div className="lg:col-span-3 xl:col-span-3 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-2">Tỷ lệ đơn hàng</h3>
          <div className="h-[180px] w-full relative mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={ORDER_RATE_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  {ORDER_RATE_DATA.map((entry, index) => (
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
              <span className="text-xl font-black text-slate-800 leading-none">2.845</span>
              <span className="text-[10px] font-bold text-slate-400 mt-1 uppercase">Tổng đơn</span>
            </div>
          </div>
          {/* Legend */}
          <div className="space-y-2">
            {ORDER_RATE_DATA.map((item, idx) => {
              const total = ORDER_RATE_DATA.reduce((acc, curr) => acc + curr.value, 0)
              const percent = ((item.value / total) * 100).toFixed(1)
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
        <div className="lg:col-span-3 xl:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800">Thông báo</h3>
            <button className="text-xs text-blue-600 hover:underline">Xem tất cả</button>
          </div>
          <div className="flex-1 space-y-4 overflow-y-auto custom-scrollbar pr-1 -mr-2">
            {[
              { title: 'Đơn hàng #TZ1056 vừa được tạo', time: '2 phút trước', icon: ShoppingCart, color: 'text-purple-600', bg: 'bg-purple-100' },
              { title: 'Sản phẩm "Laptop ASUS ROG" đã hết hàng', time: '15 phút trước', icon: Package, color: 'text-red-600', bg: 'bg-red-100' },
              { title: 'Có 5 đơn hàng chờ xác nhận', time: '30 phút trước', icon: FileTextIcon, color: 'text-yellow-600', bg: 'bg-yellow-100' },
              { title: 'Khách hàng Nguyễn Văn A vừa đăng ký tài khoản', time: '1 giờ trước', icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
            ].map((noti, idx) => (
              <div key={idx} className="flex gap-3 items-start">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${noti.bg} ${noti.color}`}>
                  <noti.icon size={14} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-700 leading-snug mb-0.5 line-clamp-2">{noti.title}</p>
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
        <div className="xl:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm overflow-hidden flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800">Đơn hàng mới nhất</h3>
            <button className="text-xs text-blue-600 hover:underline">Xem tất cả</button>
          </div>
          <div className="overflow-x-auto -mx-5 px-5">
            <table className="w-full text-left border-collapse whitespace-nowrap min-w-[700px]">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <th className="pb-3 pr-4 font-bold">Mã đơn</th>
                  <th className="pb-3 px-4 font-bold">Khách hàng</th>
                  <th className="pb-3 px-4 font-bold">Tổng tiền</th>
                  <th className="pb-3 px-4 font-bold">Thanh toán</th>
                  <th className="pb-3 px-4 font-bold">Trạng thái</th>
                  <th className="pb-3 px-4 font-bold">Ngày đặt</th>
                  <th className="pb-3 pl-4 text-center font-bold">Thao tác</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-slate-100">
                {RECENT_ORDERS.map((order, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 pr-4 font-bold text-blue-600 cursor-pointer hover:underline">{order.id}</td>
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
                      <button className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Products */}
        <div className="xl:col-span-1 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800">Top sản phẩm bán chạy</h3>
            <button className="text-xs text-blue-600 hover:underline">Xem tất cả</button>
          </div>
          <div className="space-y-4">
            {TOP_PRODUCTS.map((prod) => (
              <div key={prod.id} className="flex items-center gap-4">
                <span className="text-sm font-black text-slate-400 w-4 text-center">{prod.id}</span>
                <div className="w-10 h-10 rounded-lg border border-slate-100 overflow-hidden shrink-0">
                  <img src={prod.img} alt={prod.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate mb-1">{prod.name}</p>
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
            ))}
          </div>
        </div>
      </div>

      {/* ─── 4 Bottom Mini Cards ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mt-2">
        {MINI_STATS.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-4 shadow-sm">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${stat.bg} ${stat.color}`}>
              <stat.icon size={20} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-0.5">{stat.title}</p>
              <h4 className="text-lg font-black text-slate-800 leading-tight">{stat.value}</h4>
              <p className="text-[10px] font-bold text-green-500 mt-1">{stat.trend} <span className="text-slate-400 font-medium">so với tháng trước</span></p>
            </div>
          </div>
        ))}
      </div>

    </div>
  )
}

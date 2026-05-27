import { useState } from 'react'
import { Link } from 'react-router-dom'
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
import { StarDisplay } from '../ReviewPage/components/ReviewComponents'

// Mock Data
const dataPie = [
  { name: 'Tích cực', value: 983, color: '#10B981' },
  { name: 'Trung tính', value: 176, color: '#FBBF24' },
  { name: 'Tiêu cực', value: 89, color: '#EF4444' },
]

const dataTrend = [
  { name: '20/04', pos: 70, neu: 20, neg: 10 },
  { name: '27/04', pos: 75, neu: 25, neg: 15 },
  { name: '04/05', pos: 80, neu: 20, neg: 12 },
  { name: '11/05', pos: 72, neu: 28, neg: 10 },
  { name: '18/05', pos: 76, neu: 30, neg: 13 },
]

const aspects = [
  { name: 'Hiệu năng', score: 4.7, count: 456, icon: Cpu },
  { name: 'Thiết kế', score: 4.6, count: 321, icon: PenTool },
  { name: 'Màn hình', score: 4.5, count: 269, icon: Monitor },
  { name: 'Tản nhiệt', score: 4.1, count: 198, icon: Thermometer },
  { name: 'Pin', score: 3.5, count: 176, icon: Battery },
  { name: 'Âm thanh', score: 3.8, count: 142, icon: Speaker },
  { name: 'Giá cả', score: 4.0, count: 118, icon: DollarSign },
]

const reviews = [
  {
    id: 1,
    name: 'Trần Minh Quân',
    date: '20/05/2024 - 22:15',
    rating: 5,
    content: 'Hiệu năng quá mạnh trong tầm giá, chạy game AAA mượt ở setting cao. Máy mỏng nhẹ, thiết kế đẹp, màn hình 2K rất sắc nét. Rất hài lòng!',
    config: 'Ryzen 9 / RTX 4060 / 16GB / 512GB',
    likes: 12,
    avatar: 'T'
  },
  {
    id: 2,
    name: 'Phạm Hoàng Nam',
    date: '19/05/2024 - 18:40',
    rating: 4,
    content: 'Máy chạy rất mượt, nhưng pin hơi yếu, chỉ được khoảng 4-5 tiếng khi làm việc văn phòng. Ngoài ra thì mọi thứ đều ổn.',
    config: 'Ryzen 9 / RTX 4060 / 16GB / 512GB',
    likes: 7,
    avatar: 'P'
  },
  {
    id: 3,
    name: 'Lê Nhật Anh',
    date: '18/05/2024 - 16:05',
    rating: 4,
    content: 'Máy đẹp, cấu hình mạnh nhưng tản nhiệt chưa tốt, chơi game lâu bị nóng. Loa hơi nhỏ, âm thanh không được hay cho lắm.',
    config: 'Ryzen 9 / RTX 4060 / 16GB / 512GB',
    likes: 3,
    avatar: 'L'
  }
]

export default function AiSentimentPage() {
  const [activeTab, setActiveTab] = useState('tong-quan')

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="mx-4.5 py-6 pb-16">
        
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-1.5 text-sm flex-wrap">
          <Link to="/" className="text-slate-500 hover:text-blue-600 transition-colors font-medium">Trang chủ</Link>
          <ChevronRight size={14} className="text-slate-300" />
          <Link to="/products" className="text-slate-500 hover:text-blue-600 transition-colors font-medium">Laptop</Link>
          <ChevronRight size={14} className="text-slate-300" />
          <span className="text-slate-900 font-semibold truncate max-w-[200px] sm:max-w-md">Laptop Asus ROG Zephyrus G14</span>
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
            <p className="text-slate-500 text-sm">Dữ liệu được phân tích từ 1.248 bình luận của khách hàng đã mua sản phẩm.</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500 bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm">
            <span>Cập nhật lần cuối: 21/05/2024 - 10:30</span>
            <button className="hover:text-blue-600 hover:rotate-180 transition-all duration-500"><RefreshCw size={14} /></button>
          </div>
        </div>

        {/* Product Card Info */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-24 h-24 shrink-0 bg-slate-50 rounded-xl border border-slate-100 p-2 flex items-center justify-center">
              {/* Fake Product Image */}
              <img src="https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=200&q=80" alt="Laptop" className="w-full h-full object-cover rounded-lg" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-1">Laptop Asus ROG Zephyrus G14 GA402XV</h2>
              <p className="text-sm text-slate-500 mb-3">Ryzen 9 7940HS / 16GB RAM / 512GB SSD / RTX 4060 / 14 inch</p>
              <div className="flex items-center gap-3">
                <StarDisplay value={4.6} size={14} />
                <span className="text-sm font-bold text-slate-800">4.6/5 <span className="text-slate-500 font-normal">(248 đánh giá)</span></span>
              </div>
              <div className="mt-2 text-xl font-black text-blue-600">32.990.000đ</div>
            </div>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <Link to="/products/1" className="flex-1 md:flex-none px-6 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-sm hover:bg-slate-50 text-center transition-colors">
              Xem chi tiết sản phẩm
            </Link>
            <Link to="/review/1" className="flex-1 md:flex-none px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 flex items-center justify-center gap-2 transition-colors">
              Tất cả đánh giá <ChevronDown size={16} />
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-6 border-b border-slate-200 mb-6 overflow-x-auto no-scrollbar">
          {['Tổng quan cảm xúc', 'Phân tích theo khía cạnh', 'Xu hướng theo thời gian', 'Từ khóa nổi bật', 'Bình luận chi tiết'].map((tab, idx) => {
            const slug = tab.toLowerCase().replace(/ /g, '-')
            const isActive = activeTab === slug || (idx === 0 && activeTab === 'tong-quan')
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(idx === 0 ? 'tong-quan' : slug)}
                className={`pb-3 text-sm font-bold whitespace-nowrap transition-colors relative ${isActive ? 'text-blue-600' : 'text-slate-500 hover:text-slate-800'}`}
              >
                {tab}
                {isActive && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full" />}
              </button>
            )
          })}
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-12 gap-6">
          
          {/* TỔNG QUAN CẢM XÚC */}
          <div className="col-span-12 lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide mb-6">Tổng quan cảm xúc</h3>
            
            <div className="flex items-center justify-between mb-8 flex-1">
              {/* Donut Chart */}
              <div className="relative w-[140px] h-[140px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={dataPie} innerRadius={50} outerRadius={70} paddingAngle={2} dataKey="value" stroke="none">
                      {dataPie.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-xl font-black text-slate-800 leading-none">1.248</span>
                  <span className="text-[10px] text-slate-500 mt-1 uppercase">Tổng bình luận</span>
                </div>
              </div>
              
              {/* Legend */}
              <div className="space-y-4">
                {dataPie.map(item => (
                  <div key={item.name} className="flex items-center gap-3 text-sm">
                    <div className="flex items-center gap-1.5 w-[85px]">
                      <div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: item.color}}></div>
                      <span className="text-slate-600">{item.name}</span>
                    </div>
                    <span className="font-bold text-slate-800">
                      {((item.value / 1248) * 100).toFixed(1)}% <span className="text-slate-400 font-normal text-xs">({item.value})</span>
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
                  <span className="text-3xl font-black text-blue-600 leading-none">4.2<span className="text-lg text-slate-400">/5</span></span>
                  <div className="flex items-center gap-1 text-green-600 text-xs font-bold bg-green-50 px-2 py-1 rounded-md">
                    <Smile size={12} /> Tích cực
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 leading-tight">Dựa trên phân tích AI từ bình luận của khách hàng</span>
              </div>
              
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex flex-col justify-between">
                <span className="text-xs font-bold text-slate-600 mb-2">Độ tin cậy của phân tích</span>
                <div className="flex items-end gap-2 mb-2">
                  <span className="text-3xl font-black text-blue-600 leading-none">92%</span>
                  <ShieldCheck size={20} className="text-blue-500 mb-1" />
                </div>
                <span className="text-[10px] text-slate-400 leading-tight">Độ chính xác của mô hình AI</span>
              </div>
            </div>
          </div>

          {/* PHÂN BỐ CẢM XÚC */}
          <div className="col-span-12 lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide mb-6">Phân bố cảm xúc</h3>
            <div className="flex-1 min-h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dataTrend} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} dx={-10} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                  <RechartsTooltip />
                  <Line type="monotone" dataKey="pos" stroke="#10B981" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="neu" stroke="#FBBF24" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="neg" stroke="#EF4444" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
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
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide">Từ khóa nổi bật <Info size={14} className="inline text-slate-400 mb-0.5 ml-1" /></h3>
            </div>
            
            <div className="space-y-5 flex-1">
              <div>
                <div className="flex items-center gap-1.5 text-green-600 font-bold text-sm mb-3">
                  <Smile size={16} /> Tích cực
                </div>
                <div className="flex flex-wrap gap-2">
                  {[
                    {t: 'hiệu năng mạnh', c: 124}, {t: 'chạy mượt', c: 98}, {t: 'thiết kế đẹp', c: 87},
                    {t: 'màn hình đẹp', c: 76}, {t: 'tản nhiệt tốt', c: 72}
                  ].map(kw => (
                    <div key={kw.t} className="flex items-center bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
                      <span className="px-2.5 py-1 text-xs text-slate-700 bg-slate-50">{kw.t}</span>
                      <span className="px-2 py-1 text-[10px] text-slate-400 border-l border-slate-200">{kw.c}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-1.5 text-red-500 font-bold text-sm mb-3">
                  <Frown size={16} /> Tiêu cực
                </div>
                <div className="flex flex-wrap gap-2">
                  {[
                    {t: 'pin yếu', c: 36}, {t: 'giá cao', c: 28}, {t: 'nóng máy', c: 18},
                    {t: 'loa nhỏ', c: 12}, {t: 'khó nâng cấp', c: 9}
                  ].map(kw => (
                    <div key={kw.t} className="flex items-center bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
                      <span className="px-2.5 py-1 text-xs text-slate-700 bg-slate-50">{kw.t}</span>
                      <span className="px-2 py-1 text-[10px] text-slate-400 border-l border-slate-200">{kw.c}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <button className="mt-6 text-sm font-bold text-blue-600 hover:text-blue-800 flex items-center justify-center gap-1">
              Xem tất cả từ khóa <ArrowRight size={14} />
            </button>
          </div>

          {/* BÌNH LUẬN CHI TIẾT */}
          <div className="col-span-12 lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide mb-6">Bình luận chi tiết (1.248)</h3>
            
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="relative">
                <select className="appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 pr-10 text-sm text-slate-700 outline-none hover:border-slate-300 w-full sm:w-auto font-medium">
                  <option>Tất cả cảm xúc</option>
                  <option>Tích cực</option>
                  <option>Trung tính</option>
                  <option>Tiêu cực</option>
                </select>
                <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
              <div className="relative">
                <select className="appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 pr-10 text-sm text-slate-700 outline-none hover:border-slate-300 w-full sm:w-auto font-medium">
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
                <input type="text" placeholder="Tìm kiếm bình luận..." className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 pl-10 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all" />
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            {/* Reviews List */}
            <div className="space-y-0 divide-y divide-slate-100">
              {reviews.map(review => (
                <div key={review.id} className="py-5 first:pt-0 last:pb-0 group">
                  <div className="flex gap-4 items-start">
                    <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shrink-0 shadow-sm">
                      {review.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div>
                          <p className="text-sm font-bold text-slate-900">{review.name}</p>
                          <div className="flex items-center gap-1 text-green-600 text-[10px] font-bold mt-0.5">
                            <CheckCircle2 size={10} /> Đã mua hàng
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-slate-400">
                          <button className="hover:text-blue-600 transition-colors flex items-center gap-1 text-xs">
                            <ThumbsUp size={14} /> {review.likes}
                          </button>
                          <button className="hover:text-slate-700 transition-colors">
                            <MoreHorizontal size={16} />
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 mb-2">
                        <StarDisplay value={review.rating} size={14} />
                      </div>
                      
                      <p className="text-sm text-slate-700 leading-relaxed mb-3">{review.content}</p>
                      
                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        <span>{review.date}</span>
                        <span className="w-1 h-1 bg-slate-300 rounded-full" />
                        <span className="truncate">Cấu hình: {review.config}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 text-center border-t border-slate-100 pt-6">
              <button className="text-sm font-bold text-blue-600 hover:text-blue-800 flex items-center justify-center gap-1 mx-auto">
                Xem thêm bình luận <ChevronDown size={14} />
              </button>
            </div>
          </div>

          {/* PHÂN TÍCH THEO KHÍA CẠNH */}
          <div className="col-span-12 lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide mb-6">Phân tích theo khía cạnh</h3>
            
            <div className="space-y-5 flex-1">
              {aspects.map(aspect => (
                <div key={aspect.name}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-blue-600 font-bold text-sm">
                      <aspect.icon size={16} /> <span className="text-slate-700">{aspect.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-black text-slate-800">{aspect.score.toFixed(1)}/5</div>
                      <div className="text-[10px] text-slate-400">({aspect.count} bình luận)</div>
                    </div>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${aspect.score >= 4.5 ? 'bg-green-500' : aspect.score >= 4.0 ? 'bg-green-400' : aspect.score >= 3.0 ? 'bg-yellow-400' : 'bg-red-500'}`}
                      style={{ width: `${(aspect.score / 5) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <button className="mt-6 text-sm font-bold text-blue-600 hover:text-blue-800 flex items-center justify-center gap-1 border-t border-slate-100 pt-6 w-full">
              Xem chi tiết tất cả khía cạnh <ArrowRight size={14} />
            </button>
          </div>

        </div>

        {/* Footer Note */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-6 bg-blue-50/50 rounded-xl border border-blue-100 mb-8">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <Info size={14} className="text-blue-500" /> 
            <span>AI phân tích cảm xúc sử dụng công nghệ xử lý ngôn ngữ tự nhiên (NLP) để phân tích và đánh giá cảm xúc trong bình luận của khách hàng.</span>
          </div>
          <button className="text-xs font-bold text-blue-600 hover:text-blue-800 whitespace-nowrap flex items-center gap-1">
            Tìm hiểu thêm về công nghệ AI của chúng tôi <ArrowRight size={12} />
          </button>
        </div>

      </div>
    </div>
  )
}

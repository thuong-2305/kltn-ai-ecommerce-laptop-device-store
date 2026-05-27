import { useState } from 'react'
import { Link } from 'react-router-dom'

export function OrdersTab() {
  const [activeFilter, setActiveFilter] = useState('all')

  const MOCK_ORDERS = [
    {
      id: '#TECHZONE10234',
      date: '20/05/2024 - 10:30',
      total: '31.743.000đ',
      status: 'shipping',
      items: 3,
      images: [
        'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=50&h=50&fit=crop',
        'https://images.unsplash.com/photo-1527814050087-179f00222cb8?w=50&h=50&fit=crop',
        'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=50&h=50&fit=crop'
      ],
      steps: [
        { label: 'Đặt hàng thành công', time: '20/05/2024 - 10:30', status: 'done' },
        { label: 'Đang xử lý', time: '20/05/2024 - 10:35', status: 'done' },
        { label: 'Đang giao hàng', time: '21/05/2024 - 09:15', status: 'active' },
        { label: 'Hoàn thành', time: '', status: 'pending' },
      ],
      mainAction: 'Theo dõi đơn hàng',
      mainActionVariant: 'blue'
    },
    {
      id: '#TECHZONE10098',
      date: '10/05/2024 - 14:22',
      total: '15.890.000đ',
      status: 'delivered',
      items: 2,
      images: [
        'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=50&h=50&fit=crop',
        'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=50&h=50&fit=crop'
      ],
      steps: [
        { label: 'Đặt hàng thành công', time: '10/05/2024 - 14:22', status: 'done' },
        { label: 'Đang xử lý', time: '10/05/2024 - 14:25', status: 'done' },
        { label: 'Đã giao hàng', time: '12/05/2024 - 10:15', status: 'done' },
        { label: 'Hoàn thành', time: '12/05/2024 - 10:15', status: 'success' },
      ],
      mainAction: 'Xem chi tiết',
      mainActionVariant: 'outline'
    },
    {
      id: '#TECHZONE09921',
      date: '02/05/2024 - 09:10',
      total: '2.990.000đ',
      status: 'cancelled',
      items: 1,
      images: [
        'https://images.unsplash.com/photo-1595225476474-87563907a212?w=50&h=50&fit=crop'
      ],
      steps: [
        { label: 'Đặt hàng thành công', time: '02/05/2024 - 09:10', status: 'done' },
        { label: 'Đã hủy đơn', time: '02/05/2024 - 09:30', status: 'error' },
        { label: 'Đã giao hàng', time: '', status: 'pending' },
        { label: 'Hoàn thành', time: '', status: 'pending' },
      ],
      mainAction: 'Xem chi tiết',
      mainActionVariant: 'outline'
    },
    {
      id: '#TECHZONE09811',
      date: '25/04/2024 - 16:45',
      total: '8.790.000đ',
      status: 'completed',
      items: 2,
      images: [
        'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=50&h=50&fit=crop',
        'https://images.unsplash.com/photo-1628102491629-778571d893a3?w=50&h=50&fit=crop'
      ],
      steps: [
        { label: 'Đặt hàng thành công', time: '25/04/2024 - 16:45', status: 'done' },
        { label: 'Đang xử lý', time: '25/04/2024 - 16:50', status: 'done' },
        { label: 'Đã giao hàng', time: '27/04/2024 - 11:20', status: 'done' },
        { label: 'Hoàn thành', time: '27/04/2024 - 11:20', status: 'success' },
      ],
      mainAction: 'Xem chi tiết',
      mainActionVariant: 'outline'
    },
  ]

  const statusCfg = {
    shipping:  { label: 'Đang giao hàng', cls: 'bg-blue-100 text-blue-700' },
    delivered: { label: 'Đã giao hàng', cls: 'bg-green-100 text-green-700' },
    cancelled: { label: 'Đã hủy', cls: 'bg-slate-200 text-slate-700' },
    completed: { label: 'Hoàn thành', cls: 'bg-green-100 text-green-700' },
  }

  return (
    <div className="space-y-6">
      
      {/* Filter Bar */}
      <div className="flex flex-col xl:flex-row gap-3">
        <div className="w-full xl:w-48 shrink-0 relative">
          <select 
            value={activeFilter} onChange={(e) => setActiveFilter(e.target.value)}
            className="w-full appearance-none bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-700 outline-none hover:border-slate-300 focus:border-blue-500 transition-colors"
          >
            <option value="all">Tất cả đơn hàng</option>
            <option value="shipping">Đang giao</option>
            <option value="completed">Hoàn thành</option>
            <option value="cancelled">Đã huỷ</option>
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
          </div>
        </div>
        
        <div className="flex flex-1 flex-col sm:flex-row gap-3">
          <div className="flex flex-1 gap-3">
            <div className="relative flex-1">
              <input type="text" placeholder="Từ ngày" className="w-full bg-white border border-slate-200 rounded-lg pl-10 pr-4 py-2.5 text-sm outline-none hover:border-slate-300 focus:border-blue-500 transition-colors" />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              </div>
            </div>
            <div className="relative flex-1">
              <input type="text" placeholder="Đến ngày" className="w-full bg-white border border-slate-200 rounded-lg pl-10 pr-4 py-2.5 text-sm outline-none hover:border-slate-300 focus:border-blue-500 transition-colors" />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              </div>
            </div>
          </div>
          
          <div className="relative flex-1 xl:max-w-xs">
            <input type="text" placeholder="Tìm theo mã đơn hàng..." className="w-full bg-white border border-slate-200 rounded-lg pl-4 pr-10 py-2.5 text-sm outline-none hover:border-slate-300 focus:border-blue-500 transition-colors" />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </div>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {MOCK_ORDERS.filter(o => activeFilter === 'all' || o.status === activeFilter).map((order, idx) => {
          const cfg = statusCfg[order.status]
          return (
            <div key={idx} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              
              {/* Order Header */}
              <div className="px-5 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                  <div><span className="text-slate-500">Mã đơn hàng: </span><span className="font-black text-slate-900">{order.id}</span></div>
                  <div><span className="text-slate-500">Đặt ngày: </span><span className="text-slate-700 font-medium">{order.date}</span></div>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div><span className="text-slate-500">Tổng tiền: </span><span className="font-black text-slate-900">{order.total}</span></div>
                  <span className={`px-3 py-1 rounded-md text-xs font-bold ${cfg.cls}`}>{cfg.label}</span>
                </div>
              </div>

              {/* Order Body */}
              <div className="p-5 flex flex-col lg:flex-row gap-6 lg:items-center">
                
                {/* Images */}
                <div className="w-full lg:w-48 shrink-0 flex flex-col gap-2">
                  <div className="flex gap-2">
                    {order.images.map((img, i) => (
                      <div key={i} className="w-[52px] h-[52px] rounded-lg border border-slate-200 p-1 bg-white">
                        <img src={img} className="w-full h-full object-contain rounded-md" alt="" />
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-slate-500">{order.items} sản phẩm</p>
                  <Link to={`/order-tracking/${order.id.replace('#', '')}`} className="text-xs font-bold text-blue-600 flex items-center gap-1 hover:text-blue-800 transition-colors w-fit">
                    Xem chi tiết <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="m6 9 6 6 6-6"/></svg>
                  </Link>
                </div>

                {/* Progress Stepper */}
                <div className="flex-1 overflow-x-auto py-2 no-scrollbar">
                  <div className="flex items-start min-w-[500px]">
                    {order.steps.map((step, i) => {
                      const isLast = i === order.steps.length - 1
                      
                      let iconBg = 'bg-slate-100'
                      let iconColor = 'text-slate-300'
                      let lineColor = 'bg-slate-200'
                      let iconContent = <span className="text-[10px] font-bold">{i + 1}</span>
                      
                      if (step.status === 'done' || step.status === 'success') {
                        iconBg = 'bg-blue-600'
                        if (step.status === 'success') iconBg = 'bg-green-500'
                        iconColor = 'text-white'
                        lineColor = 'bg-blue-600'
                        iconContent = <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      } else if (step.status === 'active') {
                        iconBg = 'bg-white border-2 border-blue-600'
                        iconColor = 'text-blue-600'
                        lineColor = 'bg-slate-200'
                        iconContent = <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                      } else if (step.status === 'error') {
                        iconBg = 'bg-red-500'
                        iconColor = 'text-white'
                        lineColor = 'bg-slate-200'
                        iconContent = <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                      }

                      return (
                        <div key={i} className="flex-1 flex flex-col items-center relative">
                          {/* Line */}
                          {!isLast && (
                            <div className={`absolute top-2.5 left-1/2 w-full h-0.5 ${lineColor} -z-10`} />
                          )}
                          
                          {/* Circle */}
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center mb-2 z-10 ${iconBg} ${iconColor}`}>
                            {iconContent}
                          </div>
                          
                          {/* Text */}
                          <p className={`text-[11px] font-bold text-center ${step.status === 'pending' ? 'text-slate-400' : 'text-slate-800'}`}>
                            {step.label}
                          </p>
                          {step.time && (
                            <p className="text-[10px] text-slate-400 mt-0.5 text-center">{step.time}</p>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Actions */}
                <div className="w-full lg:w-40 shrink-0 flex flex-col gap-2 border-t lg:border-t-0 lg:border-l border-slate-100 pt-4 lg:pt-0 lg:pl-6">
                  {order.mainActionVariant === 'blue' ? (
                    <Link to={`/order-tracking/${order.id.replace('#', '')}`} className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors text-center block">
                      {order.mainAction}
                    </Link>
                  ) : (
                    <Link to={`/order-tracking/${order.id.replace('#', '')}`} className="w-full py-2 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors text-center block">
                      {order.mainAction}
                    </Link>
                  )}
                  {order.status !== 'cancelled' && (
                    <button className="w-full py-2 rounded-lg border border-blue-200 hover:bg-blue-50 text-blue-600 text-xs font-bold transition-colors block text-center">
                      Mua lại
                    </button>
                  )}
                </div>

              </div>
            </div>
          )
        })}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-center gap-2 pt-4">
        <button className="w-8 h-8 rounded border border-blue-600 bg-blue-600 text-white flex items-center justify-center text-sm font-bold shadow-sm">1</button>
        <button className="w-8 h-8 rounded border border-slate-200 text-slate-600 flex items-center justify-center text-sm font-bold hover:bg-slate-50 transition-colors">2</button>
        <button className="w-8 h-8 rounded border border-slate-200 text-slate-600 flex items-center justify-center text-sm font-bold hover:bg-slate-50 transition-colors">3</button>
        <span className="px-2 text-slate-400">...</span>
        <button className="w-8 h-8 rounded border border-slate-200 text-slate-600 flex items-center justify-center text-sm font-bold hover:bg-slate-50 transition-colors">10</button>
        <button className="w-8 h-8 rounded border border-slate-200 text-slate-600 flex items-center justify-center hover:bg-slate-50 transition-colors">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>
        </button>
      </div>

    </div>
  )
}

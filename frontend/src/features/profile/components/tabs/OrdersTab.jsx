import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { Package, Truck, Info, Calendar, DollarSign, Search, XCircle, ChevronRight, RefreshCw } from 'lucide-react'

const fmt = (n) => Number(n || 0).toLocaleString('vi-VN') + '₫'

const getOrderSteps = (status, dateOrdered, dateShipped) => {
  const formattedOrderTime = dateOrdered ? new Date(dateOrdered).toLocaleString('vi-VN') : ''
  const formattedShipTime = dateShipped ? new Date(dateShipped).toLocaleString('vi-VN') : ''
  
  if (status === 'cancelled') {
    return [
      { label: 'Đặt hàng thành công', time: formattedOrderTime, status: 'done' },
      { label: 'Đã hủy đơn', time: '', status: 'error' },
      { label: 'Đang giao hàng', time: '', status: 'pending' },
      { label: 'Hoàn thành', time: '', status: 'pending' },
    ]
  }

  return [
    { label: 'Đặt hàng thành công', time: formattedOrderTime, status: 'done' },
    { 
      label: 'Đang xử lý', 
      time: '', 
      status: ['confirmed', 'shipping', 'delivered'].includes(status) ? 'done' : 'active' 
    },
    { 
      label: 'Đang giao hàng', 
      time: formattedShipTime, 
      status: status === 'delivered' ? 'done' : status === 'shipping' ? 'active' : 'pending' 
    },
    { 
      label: 'Hoàn thành', 
      time: formattedShipTime, 
      status: status === 'delivered' ? 'success' : 'pending' 
    },
  ]
}

export function OrdersTab() {
  const [activeFilter, setActiveFilter] = useState('all')
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Filters
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [searchCode, setSearchCode] = useState('')

  // Pagination
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem('ld_access')
      if (!token) {
        setError('Bạn chưa đăng nhập. Vui lòng đăng nhập để xem đơn hàng.')
        setLoading(false)
        return
      }
      const res = await axios.get('http://localhost:8000/api/payment/orders/history/', {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          status: activeFilter,
          from_date: fromDate,
          to_date: toDate,
          search: searchCode,
          page: page
        }
      })
      setOrders(res.data.results || [])
      setTotalCount(res.data.count || 0)
      setTotalPages(Math.ceil((res.data.count || 0) / 10))
    } catch (err) {
      console.error('Error fetching order history:', err)
      setError('Không thể tải lịch sử đơn hàng. Vui lòng thử lại sau.')
    } finally {
      setLoading(false)
    }
  }, [activeFilter, fromDate, toDate, searchCode, page])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  useEffect(() => {
    setPage(1)
  }, [activeFilter, fromDate, toDate, searchCode])

  const handleCancelOrder = async (orderId) => {
    if (window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này không?')) {
      try {
        const token = localStorage.getItem('ld_access')
        await axios.post(`http://localhost:8000/api/payment/orders/${orderId}/cancel/`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        })
        alert('Đơn hàng đã được hủy thành công.')
        fetchOrders()
      } catch (err) {
        console.error('Error cancelling order:', err)
        alert(err.response?.data?.error || 'Không thể hủy đơn hàng. Vui lòng liên hệ hỗ trợ.')
      }
    }
  }

  const statusCfg = {
    pending:   { label: 'Chờ xử lý', cls: 'bg-amber-150 text-amber-800 border-amber-200' },
    confirmed: { label: 'Đã xác nhận', cls: 'bg-blue-50 text-blue-700 border-blue-250' },
    shipping:  { label: 'Đang giao hàng', cls: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    delivered: { label: 'Đã giao hàng', cls: 'bg-green-50 text-green-700 border-green-200' },
    cancelled: { label: 'Đã hủy', cls: 'bg-slate-100 text-slate-600 border-slate-200' },
  }

  return (
    <div className="space-y-6">
      
      {/* Filter Bar */}
      <div className="flex flex-col xl:flex-row gap-3">
        <div className="w-full xl:w-48 shrink-0 relative">
          <select 
            value={activeFilter} onChange={(e) => setActiveFilter(e.target.value)}
            className="w-full appearance-none bg-white border border-slate-250 rounded-xl px-4 py-2.5 text-sm text-slate-700 outline-none hover:border-slate-350 focus:border-blue-500 transition-colors cursor-pointer font-bold"
          >
            <option value="all">Tất cả đơn hàng</option>
            <option value="shipping">Đang giao</option>
            <option value="completed">Hoàn thành</option>
            <option value="cancelled">Đã huỷ</option>
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
          </div>
        </div>
        
        <div className="flex flex-1 flex-col sm:flex-row gap-3">
          <div className="flex flex-1 gap-3">
            <div className="relative flex-1">
              <input 
                type="date" 
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                placeholder="Từ ngày" 
                className="w-full bg-white border border-slate-250 rounded-xl pl-10 pr-4 py-2 text-sm outline-none hover:border-slate-350 focus:border-blue-500 transition-colors text-slate-700 font-bold" 
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <Calendar size={14} />
              </div>
            </div>
            <div className="relative flex-1">
              <input 
                type="date" 
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                placeholder="Đến ngày" 
                className="w-full bg-white border border-slate-250 rounded-xl pl-10 pr-4 py-2 text-sm outline-none hover:border-slate-350 focus:border-blue-500 transition-colors text-slate-700 font-bold" 
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <Calendar size={14} />
              </div>
            </div>
          </div>
          
          <div className="relative flex-1 xl:max-w-xs">
            <input 
              type="text" 
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              placeholder="Tìm theo mã đơn hàng..." 
              className="w-full bg-white border border-slate-250 rounded-xl pl-4 pr-10 py-2.5 text-sm outline-none hover:border-slate-350 focus:border-blue-500 transition-colors font-bold text-slate-700" 
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
              <Search size={14} />
            </div>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white border border-slate-200 rounded-2xl gap-3">
            <RefreshCw size={24} className="text-blue-600 animate-spin" />
            <p className="text-slate-500 font-semibold text-sm">Đang tải danh sách đơn hàng...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-5 text-center text-red-700 font-bold text-sm">
            {error}
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white border border-slate-200 rounded-2xl text-slate-400">
            <Package size={40} className="text-slate-300 mb-3" />
            <p className="font-bold text-slate-600 mb-1">Không tìm thấy đơn hàng nào</p>
            <p className="text-xs">Hãy thử đổi bộ lọc hoặc thêm đơn hàng mới.</p>
          </div>
        ) : (
          orders.map((order, idx) => {
            const steps = getOrderSteps(order.status, order.date_ordered, order.date_shipped)
            const cfg = statusCfg[order.status] || { label: order.status, cls: 'bg-slate-100 text-slate-700 border-slate-200' }
            const totalItems = order.items ? order.items.reduce((sum, item) => sum + item.quantity, 0) : 0

            return (
              <div key={order.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                
                {/* Order Header */}
                <div className="px-5 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4 bg-slate-50/50">
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                    <div>
                      <span className="text-slate-500">Mã đơn hàng: </span>
                      <span className="font-black text-slate-900">#{order.order_code || order.id}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Đặt ngày: </span>
                      <span className="text-slate-700 font-bold">
                        {order.date_ordered ? new Date(order.date_ordered).toLocaleDateString('vi-VN') : 'N/A'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div>
                      <span className="text-slate-500 font-medium">Tổng tiền: </span>
                      <span className="font-black text-blue-600">{fmt(order.amount_paid)}</span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${cfg.cls}`}>{cfg.label}</span>
                  </div>
                </div>

                {/* Order Body */}
                <div className="p-5 flex flex-col lg:flex-row gap-6 lg:items-center">
                  
                  {/* Images & items description */}
                  <div className="w-full lg:w-48 shrink-0 flex flex-col gap-2">
                    <div className="flex gap-2 flex-wrap">
                      {order.items && order.items.slice(0, 3).map((item, i) => {
                        const imgUrl = item.product_image 
                          ? (item.product_image.startsWith('http') ? item.product_image : `http://localhost:8000${item.product_image}`)
                          : null
                        return (
                          <div key={i} className="w-[52px] h-[52px] rounded-xl border border-slate-200 p-1 bg-white relative">
                            {imgUrl ? (
                              <img src={imgUrl} className="w-full h-full object-contain rounded-lg" alt={item.product_name} />
                            ) : (
                              <div className="w-full h-full bg-slate-50 rounded-lg flex items-center justify-center text-slate-300">
                                <Package size={16} />
                              </div>
                            )}
                            {item.quantity > 1 && (
                              <span className="absolute -top-1.5 -right-1.5 bg-blue-650 text-white text-[9px] font-black rounded-full h-4 min-w-4 px-1 flex items-center justify-center shadow">
                                {item.quantity}
                              </span>
                            )}
                          </div>
                        )
                      })}
                      {order.items && order.items.length > 3 && (
                        <div className="w-[52px] h-[52px] rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center text-xs font-bold text-slate-500">
                          +{order.items.length - 3}
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 font-bold">{totalItems} sản phẩm</p>
                    <Link 
                      to={`/order-tracking/${order.order_code || order.id}`} 
                      className="text-xs font-black text-blue-600 flex items-center gap-0.5 hover:text-blue-800 transition-colors w-fit uppercase"
                    >
                      Chi tiết hành trình <ChevronRight size={12} />
                    </Link>
                  </div>

                  {/* Progress Stepper */}
                  <div className="flex-1 overflow-x-auto py-2 no-scrollbar">
                    <div className="flex items-start min-w-[500px]">
                      {steps.map((step, i) => {
                        const isLast = i === steps.length - 1
                        
                        let iconBg = 'bg-slate-100'
                        let iconColor = 'text-slate-350'
                        let lineColor = 'bg-slate-200'
                        let iconContent = <span className="text-[10px] font-black">{i + 1}</span>
                        
                        if (step.status === 'done' || step.status === 'success') {
                          iconBg = step.status === 'success' ? 'bg-green-500' : 'bg-blue-600'
                          iconColor = 'text-white'
                          lineColor = step.status === 'success' ? 'bg-green-500' : 'bg-blue-600'
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
                            {/* Connector Line */}
                            {!isLast && (
                              <div className={`absolute top-2.5 left-1/2 w-full h-0.5 ${lineColor} -z-10`} />
                            )}
                            
                            {/* Step circle */}
                            <div className={`w-5.5 h-5.5 rounded-full flex items-center justify-center mb-2 z-10 font-bold ${iconBg} ${iconColor}`}>
                              {iconContent}
                            </div>
                            
                            {/* Label */}
                            <p className={`text-[11px] font-black text-center ${step.status === 'pending' ? 'text-slate-400' : 'text-slate-800'}`}>
                              {step.label}
                            </p>
                            {step.time && (
                              <p className="text-[10px] text-slate-400 mt-0.5 text-center font-medium">{step.time}</p>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="w-full lg:w-40 shrink-0 flex flex-col gap-2 border-t lg:border-t-0 lg:border-l border-slate-100 pt-4 lg:pt-0 lg:pl-6">
                    <Link 
                      to={`/order-tracking/${order.order_code || order.id}`} 
                      className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black transition-colors text-center block"
                    >
                      {['shipping', 'confirmed'].includes(order.status) ? 'Theo dõi đơn hàng' : 'Xem chi tiết'}
                    </Link>
                    {order.status === 'delivered' && (
                      order.items && order.items.length === 1 ? (
                        <Link 
                          to={`/review/${order.items[0].product_id}?order=${order.order_code || order.id}`}
                          className="w-full py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-xs font-black transition-colors text-center block"
                        >
                          Đánh giá sản phẩm
                        </Link>
                      ) : (
                        <Link 
                          to={`/order-tracking/${order.order_code || order.id}`}
                          className="w-full py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-xs font-black transition-colors text-center block"
                        >
                          Đánh giá sản phẩm
                        </Link>
                      )
                    )}
                    {order.status === 'pending' && (
                      <button 
                        onClick={() => handleCancelOrder(order.id)}
                        className="w-full py-2.5 rounded-xl border border-red-200 hover:bg-red-50 text-red-650 text-xs font-black transition-colors flex items-center justify-center gap-1"
                      >
                        <XCircle size={13} /> Hủy đơn hàng
                      </button>
                    )}
                  </div>

                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
          >
            Trước
          </button>
          <span className="text-xs text-slate-500 font-bold">
            Trang {page} / {totalPages} (Tổng {totalCount} đơn)
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
          >
            Sau
          </button>
        </div>
      )}

    </div>
  )
}

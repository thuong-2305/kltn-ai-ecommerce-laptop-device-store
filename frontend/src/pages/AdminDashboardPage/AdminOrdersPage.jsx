import { useState, useEffect } from 'react'
import { Search, Eye, Edit, Trash2, Loader2, Info, X } from 'lucide-react'
import api from '../../services/api'

const STATUS_CFG = {
  paid: 'bg-green-105 text-green-700 border border-green-200',
  unpaid: 'bg-amber-50 text-amber-700 border border-amber-200',
  shipping: 'bg-blue-50 text-blue-700 border border-blue-200',
  delivered: 'bg-green-50 text-green-700 border border-green-200',
  pending: 'bg-amber-50 text-amber-700 border border-amber-200',
  confirmed: 'bg-purple-50 text-purple-700 border border-purple-200',
  cancelled: 'bg-red-50 text-red-700 border border-red-200',
}

const STATUS_LABELS = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  shipping: 'Đang giao',
  delivered: 'Đã giao',
  cancelled: 'Đã hủy',
}

export default function AdminOrdersPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [limit] = useState(10)

  // Detail Modal States
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)

  // Edit Status Modal States
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [orderToEdit, setOrderToEdit] = useState(null)
  const [editStatus, setEditStatus] = useState('')
  const [editIsPaid, setEditIsPaid] = useState(false)
  const [editTrackingCode, setEditTrackingCode] = useState('')
  const [editLoading, setEditLoading] = useState(false)

  // Delete confirm states
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [orderToDelete, setOrderToDelete] = useState(null)

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const res = await api.get('admin/orders/', {
        params: {
          search: searchTerm,
          status: statusFilter,
          page: currentPage,
          limit: limit
        }
      })
      setOrders(res.data.results || [])
      setTotalPages(res.data.total_pages || 1)
      setTotalCount(res.data.count || 0)
      setError('')
    } catch (err) {
      setError(err.response?.data?.error || 'Không tải được danh sách đơn hàng.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [searchTerm, statusFilter, currentPage])

  const handleOpenDetails = async (orderId) => {
    setDetailLoading(true)
    setDetailModalOpen(true)
    try {
      const res = await api.get(`admin/orders/${orderId}/`)
      setSelectedOrderDetails(res.data)
    } catch (err) {
      setError('Không tải được chi tiết đơn hàng.')
      setDetailModalOpen(false)
    } finally {
      setDetailLoading(false)
    }
  }

  const handleOpenEdit = (order) => {
    setOrderToEdit(order)
    setEditStatus(order.sStatus)
    setEditIsPaid(order.pStatus === 'paid')
    setEditTrackingCode('')
    
    if (selectedOrderDetails && selectedOrderDetails.id === order.id) {
      setEditTrackingCode(selectedOrderDetails.shipping_tracking_code || '')
    }
    setEditModalOpen(true)
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    setEditLoading(true)
    try {
      await api.put(`admin/orders/${orderToEdit.id}/`, {
        status: editStatus,
        is_paid: editIsPaid,
        shipping_tracking_code: editTrackingCode
      })
      setEditModalOpen(false)
      fetchOrders()
      if (selectedOrderDetails && selectedOrderDetails.id === orderToEdit.id) {
        handleOpenDetails(orderToEdit.id)
      }
    } catch (err) {
      setError('Không cập nhật được trạng thái đơn hàng.')
    } finally {
      setEditLoading(false)
    }
  }

  const handleConfirmDelete = (order) => {
    setOrderToDelete(order)
    setDeleteConfirmOpen(true)
  }

  const handleDeleteSubmit = async () => {
    setLoading(true)
    try {
      await api.delete(`admin/orders/${orderToDelete.id}/`)
      setDeleteConfirmOpen(false)
      setOrderToDelete(null)
      fetchOrders()
    } catch (err) {
      setError(err.response?.data?.error || 'Không thể xóa đơn hàng.')
      setLoading(false)
    }
  }

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  const startRange = totalCount > 0 ? (currentPage - 1) * limit + 1 : 0
  const endRange = Math.min(currentPage * limit, totalCount)
  const pageNumbers = []
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i)
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Quản lý Đơn hàng</h1>
          <p className="text-sm text-slate-500 mt-1">Theo dõi, xử lý và cập nhật trạng thái đơn hàng.</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Tìm kiếm theo mã đơn, tên khách, số điện thoại..." 
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:bg-white transition-colors"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1)
            }}
          />
        </div>
        <div className="flex gap-4">
          <select 
            className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-700 outline-none focus:border-blue-500 transition-colors cursor-pointer"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value)
              setCurrentPage(1)
            }}
          >
            <option value="">Trạng thái: Tất cả</option>
            <option value="pending">Chờ xác nhận</option>
            <option value="confirmed">Đã xác nhận</option>
            <option value="shipping">Đang giao</option>
            <option value="delivered">Đã giao</option>
            <option value="cancelled">Đã hủy</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl flex items-center gap-3">
          <Info size={18} />
          <p className="font-semibold">{error}</p>
        </div>
      )}

      {/* Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-w-0">
        <div className="overflow-x-auto">
          {loading && orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="animate-spin text-blue-600 mb-2" size={32} />
              <p className="text-slate-500 text-sm font-semibold">Đang tải danh sách đơn hàng...</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-4 px-6">Mã đơn</th>
                  <th className="py-4 px-6">Khách hàng</th>
                  <th className="py-4 px-6">Tổng tiền</th>
                  <th className="py-4 px-6">Thanh toán</th>
                  <th className="py-4 px-6">Trạng thái</th>
                  <th className="py-4 px-6">Ngày đặt</th>
                  <th className="py-4 px-6 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.length > 0 ? (
                  orders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td 
                        onClick={() => handleOpenDetails(order.id)}
                        className="py-3 px-6 font-bold text-blue-600 hover:underline cursor-pointer"
                      >
                        {order.order_code}
                      </td>
                      <td className="py-3 px-6">
                        <p className="font-bold text-slate-800 text-sm">{order.customer}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{order.phone}</p>
                      </td>
                      <td className="py-3 px-6 text-sm font-bold text-slate-800">{order.total}</td>
                      <td className="py-3 px-6">
                        <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${STATUS_CFG[order.pStatus]}`}>
                          {order.payment}
                        </span>
                      </td>
                      <td className="py-3 px-6">
                        <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${STATUS_CFG[order.sStatus]}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3 px-6 text-sm text-slate-500">{order.date}</td>
                      <td className="py-3 px-6 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button 
                            onClick={() => handleOpenDetails(order.id)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer" 
                            title="Xem chi tiết"
                          >
                            <Eye size={16} />
                          </button>
                          <button 
                            onClick={() => handleOpenEdit(order)}
                            className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer" 
                            title="Cập nhật trạng thái"
                          >
                            <Edit size={16} />
                          </button>
                          <button 
                            onClick={() => handleConfirmDelete(order)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer" 
                            title="Xóa"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-slate-400 font-bold">Không tìm thấy đơn hàng nào.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Footer */}
        {totalCount > 0 && (
          <div className="px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-500">
              Hiển thị <span className="font-bold text-slate-800">{startRange}</span> đến <span className="font-bold text-slate-800">{endRange}</span> trong số <span className="font-bold text-slate-800">{totalCount}</span> đơn hàng
            </p>
            <div className="flex gap-1">
              <button 
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-650 text-sm font-medium hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
              >
                Trước
              </button>
              {pageNumbers.map(num => (
                <button 
                  key={num}
                  onClick={() => handlePageChange(num)}
                  className={`px-3 py-1.5 rounded-lg border text-sm font-medium cursor-pointer ${
                    currentPage === num 
                      ? 'border-blue-600 bg-blue-600 text-white font-bold' 
                      : 'border-slate-200 text-slate-650 hover:bg-slate-50'
                  }`}
                >
                  {num}
                </button>
              ))}
              <button 
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-650 text-sm font-medium hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ─── View Order Detail Modal ─── */}
      {detailModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-5">
            {detailLoading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="animate-spin text-blue-600 mb-2" size={32} />
                <p className="text-slate-500 font-bold text-sm">Đang tải chi tiết đơn hàng...</p>
              </div>
            ) : selectedOrderDetails && (
              <>
                {/* Header */}
                <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                  <div>
                    <h2 className="text-lg font-black text-slate-800">Chi tiết đơn hàng {selectedOrderDetails.order_code}</h2>
                    <p className="text-xs text-slate-400 mt-0.5">Đặt ngày: {selectedOrderDetails.date_ordered}</p>
                  </div>
                  <button 
                    onClick={() => setDetailModalOpen(false)}
                    className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Status bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 rounded-2xl p-4 border border-slate-200 text-xs">
                  <div>
                    <p className="font-bold text-slate-400 uppercase">Trạng thái giao</p>
                    <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-md font-bold ${STATUS_CFG[selectedOrderDetails.status]}`}>
                      {STATUS_LABELS[selectedOrderDetails.status]}
                    </span>
                  </div>
                  <div>
                    <p className="font-bold text-slate-400 uppercase">Thanh toán</p>
                    <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-md font-bold ${selectedOrderDetails.is_paid ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                      {selectedOrderDetails.is_paid ? 'Đã thanh toán' : 'Chưa thanh toán'}
                    </span>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="font-bold text-slate-400 uppercase">Mã vận đơn GHN</p>
                    <p className="font-mono text-slate-700 font-bold mt-1">{selectedOrderDetails.shipping_tracking_code || 'Chưa liên kết vận chuyển'}</p>
                  </div>
                </div>

                {/* Customer Details */}
                <div className="space-y-2">
                  <h3 className="font-bold text-slate-800 text-sm">Thông tin nhận hàng</h3>
                  <div className="text-sm bg-slate-50/50 rounded-2xl p-4 border border-slate-150 space-y-1">
                    <p><span className="font-bold text-slate-500">Người nhận:</span> <span className="font-semibold text-slate-800">{selectedOrderDetails.customer}</span></p>
                    <p><span className="font-bold text-slate-500">Số điện thoại:</span> <span className="font-semibold text-slate-800">{selectedOrderDetails.phone}</span></p>
                    <p><span className="font-bold text-slate-500">Địa chỉ giao:</span> <span className="font-semibold text-slate-800">{selectedOrderDetails.shipping_address}</span></p>
                  </div>
                </div>

                {/* Items List */}
                <div className="space-y-2">
                  <h3 className="font-bold text-slate-800 text-sm">Danh sách sản phẩm mua</h3>
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white">
                    {selectedOrderDetails.items.map((item, idx) => (
                      <div key={idx} className="flex gap-4 p-3 hover:bg-slate-50/30">
                        <div className="w-12 h-12 rounded-lg border border-slate-100 overflow-hidden shrink-0">
                          <img src={item.product_image || 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=50&h=50&fit=crop'} alt={item.product_name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-800 truncate">{item.product_name}</p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {item.variant_name && <span className="font-medium text-blue-600 mr-2">Bản: {item.variant_name}</span>}
                            <span>Số lượng: <b className="text-slate-700">{item.quantity}</b></span>
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-bold text-slate-800">{Number(item.price).toLocaleString()} đ</p>
                          <p className="text-xs text-slate-400 font-semibold mt-0.5">Tổng: {Number(item.subtotal).toLocaleString()} đ</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Summary Financials */}
                <div className="border-t border-slate-100 pt-3 flex flex-col items-end space-y-1 text-sm">
                  {selectedOrderDetails.discount_amount > 0 && (
                    <p className="text-slate-500 font-semibold">
                      Giảm giá voucher ({selectedOrderDetails.voucher_code}): <span className="text-red-500 font-bold">-{Number(selectedOrderDetails.discount_amount).toLocaleString()} đ</span>
                    </p>
                  )}
                  <p className="text-slate-800 font-black text-lg">
                    Thực tế thanh toán: <span className="text-blue-600">{Number(selectedOrderDetails.amount_paid).toLocaleString()} đ</span>
                  </p>
                </div>

                {/* Footer action */}
                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                  <button 
                    onClick={() => {
                      setDetailModalOpen(false)
                      handleOpenEdit({
                        id: selectedOrderDetails.id,
                        order_code: selectedOrderDetails.order_code,
                        customer: selectedOrderDetails.customer,
                        sStatus: selectedOrderDetails.status,
                        pStatus: selectedOrderDetails.is_paid ? 'paid' : 'unpaid'
                      })
                    }}
                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer"
                  >
                    Cập nhật đơn
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ─── Edit Status Modal ─── */}
      {editModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <h3 className="font-bold text-slate-800 text-lg">Cập nhật đơn hàng {orderToEdit?.order_code}</h3>
              <button onClick={() => setEditModalOpen(false)} className="p-1 hover:bg-slate-50 rounded-lg text-slate-400"><X size={18} /></button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">Trạng thái vận chuyển</label>
                <select 
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 cursor-pointer"
                  value={editStatus}
                  onChange={e => setEditStatus(e.target.value)}
                >
                  <option value="pending">Chờ xác nhận (Pending)</option>
                  <option value="confirmed">Đã xác nhận (Confirmed)</option>
                  <option value="shipping">Đang giao hàng (Shipping)</option>
                  <option value="delivered">Đã giao hàng (Delivered)</option>
                  <option value="cancelled">Hủy đơn hàng (Cancelled)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">Mã vận đơn (GHN)</label>
                <input 
                  type="text"
                  placeholder="Ví dụ: GHN-12345ABC"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500"
                  value={editTrackingCode}
                  onChange={e => setEditTrackingCode(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2 py-2">
                <input 
                  type="checkbox" 
                  id="editIsPaid"
                  className="rounded border-slate-350 text-blue-600 focus:ring-blue-500"
                  checked={editIsPaid}
                  onChange={e => setEditIsPaid(e.target.checked)}
                />
                <label htmlFor="editIsPaid" className="text-xs font-bold text-slate-700 cursor-pointer select-none">Đã thanh toán (Paid)</label>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setEditModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 cursor-pointer"
                >
                  Hủy
                </button>
                <button 
                  type="submit" 
                  disabled={editLoading}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-750 text-white font-bold text-xs shadow-sm cursor-pointer"
                >
                  {editLoading && <Loader2 size={12} className="animate-spin" />}
                  <span>Lưu thay đổi</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Delete Confirmation Modal ─── */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 max-w-sm w-full shadow-2xl flex flex-col items-center text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-500 flex items-center justify-center">
              <Trash2 size={24} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-lg">Xóa đơn hàng</h3>
              <p className="text-slate-500 text-sm mt-1">Bạn có chắc muốn xóa vĩnh viễn đơn hàng <b>{orderToDelete?.order_code}</b> khỏi cơ sở dữ liệu? Hành động này không thể hoàn tác.</p>
            </div>
            <div className="flex gap-3 w-full">
              <button 
                onClick={() => setDeleteConfirmOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-250 text-slate-600 font-bold text-xs hover:bg-slate-50 cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button 
                onClick={handleDeleteSubmit}
                className="flex-1 py-2.5 rounded-xl bg-red-650 hover:bg-red-700 text-white font-bold text-xs cursor-pointer"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

import { useState, useEffect } from 'react'
import { Search, Edit, Trash2, Loader2, Info, X, Mail, Eye } from 'lucide-react'
import api from '../../services/api'

const STATUS_CFG = {
  active: { label: 'Hoạt động', cls: 'bg-green-100 text-green-700' },
  inactive: { label: 'Tạm khóa', cls: 'bg-slate-100 text-slate-700' },
}

export default function AdminCustomersPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [limit, setLimit] = useState(10)

  // Edit modal states
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [customerToEdit, setCustomerToEdit] = useState(null)
  const [editIsActive, setEditIsActive] = useState(true)
  const [editLoading, setEditLoading] = useState(false)

  // Detail modal states
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [detailLoading, setDetailLoading] = useState(false)
  const [selectedCustomerDetails, setSelectedCustomerDetails] = useState(null)

  // Delete confirm states
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [customerToDelete, setCustomerToDelete] = useState(null)

  const fetchCustomers = async () => {
    setLoading(true)
    try {
      const res = await api.get('admin/users/', {
        params: {
          is_staff: 'false',
          search: searchTerm,
          page: currentPage,
          limit: limit
        }
      })
      setCustomers(res.data.results || [])
      setTotalPages(res.data.total_pages || 1)
      setTotalCount(res.data.count || 0)
      setError('')
    } catch (err) {
      setError(err.response?.data?.error || 'Không tải được danh sách khách hàng.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCustomers()
  }, [searchTerm, currentPage])

  const handleOpenDetails = async (custId) => {
    setDetailLoading(true)
    setIsDetailOpen(true)
    setSelectedCustomerDetails(null)
    try {
      const res = await api.get(`admin/users/${custId}/`)
      setSelectedCustomerDetails(res.data)
    } catch (err) {
      setError('Không tải được chi tiết lịch sử mua sắm của khách hàng.')
      setIsDetailOpen(false)
    } finally {
      setDetailLoading(false)
    }
  }

  const handleOpenEdit = (cust) => {
    setCustomerToEdit(cust)
    setEditIsActive(cust.status === 'active')
    setIsEditOpen(true)
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    setEditLoading(true)
    try {
      await api.put(`admin/users/${customerToEdit.id}/`, {
        is_active: editIsActive
      })
      setIsEditOpen(false)
      fetchCustomers()
    } catch (err) {
      setError('Không thể cập nhật thông tin khách hàng.')
    } finally {
      setEditLoading(false)
    }
  }

  const handleConfirmDelete = (cust) => {
    setCustomerToDelete(cust)
    setDeleteConfirmOpen(true)
  }

  const handleDeleteSubmit = async () => {
    setLoading(true)
    try {
      await api.delete(`admin/users/${customerToDelete.id}/`)
      setDeleteConfirmOpen(false)
      setCustomerToDelete(null)
      fetchCustomers()
    } catch (err) {
      setError(err.response?.data?.error || 'Không thể xóa khách hàng này.')
      setLoading(false)
    }
  }

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  // Calculate items range displaying
  const startRange = totalCount > 0 ? (currentPage - 1) * limit + 1 : 0
  const endRange = Math.min(currentPage * limit, totalCount)

  // Generate page numbers
  const pageNumbers = []
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i)
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Quản lý Khách hàng</h1>
          <p className="text-sm text-slate-500 mt-1">Quản lý thông tin, lịch sử mua hàng và tài khoản người dùng.</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Tìm kiếm theo tên, email, số điện thoại..." 
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:bg-white transition-colors"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1)
            }}
          />
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
          {loading && customers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="animate-spin text-blue-600 mb-2" size={32} />
              <p className="text-slate-500 text-sm font-semibold">Đang tải danh sách khách hàng...</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-4 px-6">Khách hàng</th>
                  <th className="py-4 px-6">Số điện thoại</th>
                  <th className="py-4 px-6 text-center">Đơn hàng</th>
                  <th className="py-4 px-6 text-right">Tổng chi tiêu</th>
                  <th className="py-4 px-6 text-center">Trạng thái</th>
                  <th className="py-4 px-6 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customers.length > 0 ? (
                  customers.map((cust) => {
                    const cfg = STATUS_CFG[cust.status] || STATUS_CFG.active
                    return (
                      <tr key={cust.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="py-3 px-6">
                          <div className="flex items-center gap-3">
                            <span className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 text-white font-black text-sm shrink-0 shadow-sm select-none">
                              {cust.name ? cust.name.split(' ').slice(-2).map(w => w[0]).join('').toUpperCase().slice(0, 2) : '?'}
                            </span>
                            <div>
                              <p className="font-bold text-slate-800 text-sm group-hover:text-blue-600 transition-colors cursor-pointer">{cust.name}</p>
                              <p className="text-xs text-slate-500 mt-0.5">{cust.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-6 text-sm text-slate-600 font-semibold">{cust.phone || 'Chưa cập nhật'}</td>
                        <td className="py-3 px-6 text-sm text-center font-bold text-slate-700">{cust.totalOrders}</td>
                        <td className="py-3 px-6 text-sm text-right font-black text-blue-600">{cust.totalSpent}</td>
                        <td className="py-3 px-6 text-center">
                          <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold inline-block ${cfg.cls}`}>
                            {cfg.label}
                          </span>
                        </td>
                        <td className="py-3 px-6 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button 
                              onClick={() => handleOpenDetails(cust.id)}
                              className="p-1.5 text-slate-400 hover:text-blue-650 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer" 
                              title="Xem chi tiết"
                            >
                              <Eye size={16} />
                            </button>
                            <a href={`mailto:${cust.email}`} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer" title="Gửi Email">
                              <Mail size={16} />
                            </a>
                            <button 
                              onClick={() => handleOpenEdit(cust)}
                              className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer" 
                              title="Khóa/Mở tài khoản"
                            >
                              <Edit size={16} />
                            </button>
                            <button 
                              onClick={() => handleConfirmDelete(cust)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer" 
                              title="Xóa tài khoản"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-slate-400 font-bold">Không tìm thấy khách hàng nào.</td>
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
              Hiển thị <span className="font-bold text-slate-800">{startRange}</span> đến <span className="font-bold text-slate-800">{endRange}</span> trong số <span className="font-bold text-slate-800">{totalCount}</span> khách hàng
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

      {/* ─── Edit Customer Modal ─── */}
      {isEditOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <h3 className="font-bold text-slate-800 text-lg">Cập nhật khách hàng</h3>
              <button onClick={() => setIsEditOpen(false)} className="p-1 hover:bg-slate-50 rounded-lg text-slate-400"><X size={18} /></button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="flex items-center gap-2 bg-slate-50 rounded-2xl p-4 border border-slate-200">
                <input 
                  type="checkbox" 
                  id="editIsActive"
                  className="rounded border-slate-350 text-blue-600 focus:ring-blue-500"
                  checked={editIsActive}
                  onChange={e => setEditIsActive(e.target.checked)}
                />
                <label htmlFor="editIsActive" className="text-xs font-bold text-slate-700 cursor-pointer select-none">Tài khoản hoạt động (Active)</label>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setIsEditOpen(false)}
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
              <h3 className="font-bold text-slate-800 text-lg">Xóa tài khoản</h3>
              <p className="text-slate-500 text-sm mt-1">Bạn có chắc chắn muốn xóa vĩnh viễn tài khoản khách hàng <b>{customerToDelete?.email}</b>? Hành động này sẽ xóa toàn bộ lịch sử mua sắm của họ.</p>
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
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs cursor-pointer"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Customer Details Modal ─── */}
      {isDetailOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-5">
            {detailLoading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="animate-spin text-blue-600 mb-2" size={32} />
                <p className="text-slate-500 font-bold text-sm">Đang tải chi tiết khách hàng...</p>
              </div>
            ) : selectedCustomerDetails && (
              <>
                {/* Header */}
                <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                  <div>
                    <h2 className="text-lg font-black text-slate-800">Chi tiết khách hàng</h2>
                    <p className="text-xs text-slate-400 mt-0.5">Tên đăng nhập: {selectedCustomerDetails.username}</p>
                  </div>
                  <button
                    onClick={() => setIsDetailOpen(false)}
                    className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg cursor-pointer"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Profile Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 rounded-2xl p-4 border border-slate-200 text-xs">
                  <div>
                    <p className="font-bold text-slate-400 uppercase">Họ và tên</p>
                    <p className="font-bold text-slate-800 mt-1 text-sm">{selectedCustomerDetails.name}</p>
                  </div>
                  <div>
                    <p className="font-bold text-slate-400 uppercase">Email</p>
                    <p className="font-semibold text-slate-700 mt-1 text-sm">{selectedCustomerDetails.email}</p>
                  </div>
                  <div>
                    <p className="font-bold text-slate-400 uppercase">Số điện thoại</p>
                    <p className="font-semibold text-slate-700 mt-1 text-sm">{selectedCustomerDetails.phone || 'Chưa cập nhật'}</p>
                  </div>
                  <div>
                    <p className="font-bold text-slate-400 uppercase">Ngày tham gia</p>
                    <p className="font-semibold text-slate-700 mt-1 text-sm">{selectedCustomerDetails.date_joined || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="font-bold text-slate-400 uppercase">Trạng thái hoạt động</p>
                    <span className={`inline-block mt-1.5 px-2.5 py-0.5 rounded-md font-bold ${
                      selectedCustomerDetails.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {selectedCustomerDetails.status === 'active' ? 'Hoạt động' : 'Tạm khóa'}
                    </span>
                  </div>
                </div>

                {/* Order History */}
                <div className="space-y-3">
                  <h3 className="font-bold text-slate-800 text-sm">Lịch sử đơn hàng ({selectedCustomerDetails.orders?.length || 0})</h3>
                  <div className="overflow-x-auto border border-slate-200 rounded-2xl bg-white max-h-60 overflow-y-auto">
                    <table className="w-full text-left border-collapse whitespace-nowrap text-xs">
                      <thead className="bg-slate-50 border-b border-slate-150 text-slate-500 font-bold uppercase tracking-wider sticky top-0 z-10">
                        <tr>
                          <th className="py-2.5 px-4">Mã đơn</th>
                          <th className="py-2.5 px-4">Ngày đặt</th>
                          <th className="py-2.5 px-4 text-right">Tổng tiền</th>
                          <th className="py-2.5 px-4 text-center">Thanh toán</th>
                          <th className="py-2.5 px-4 text-center">Trạng thái giao</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                        {selectedCustomerDetails.orders && selectedCustomerDetails.orders.length > 0 ? (
                          selectedCustomerDetails.orders.map((o) => (
                            <tr key={o.id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="py-2.5 px-4 font-bold text-blue-600">{o.order_code}</td>
                              <td className="py-2.5 px-4 text-slate-500">{o.date_ordered}</td>
                              <td className="py-2.5 px-4 text-right font-bold text-slate-800">
                                {o.amount_paid.toLocaleString('vi-VN')} đ
                              </td>
                              <td className="py-2.5 px-4 text-center">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  o.is_paid ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                                }`}>
                                  {o.is_paid ? 'Đã thanh toán' : 'Chưa thanh toán'}
                                </span>
                              </td>
                              <td className="py-2.5 px-4 text-center">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  o.status === 'delivered' ? 'bg-green-50 text-green-750 border border-green-200' :
                                  o.status === 'cancelled' ? 'bg-red-50 text-red-750 border border-red-200' :
                                  o.status === 'shipping' ? 'bg-blue-50 text-blue-750 border border-blue-200' :
                                  o.status === 'confirmed' ? 'bg-purple-50 text-purple-750 border border-purple-200' :
                                  'bg-amber-50 text-amber-750 border border-amber-200'
                                }`}>
                                  {o.status_display}
                                </span>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="5" className="py-6 text-center text-slate-400 font-bold">Khách hàng chưa có đơn hàng nào.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Footer action */}
                <div className="flex justify-end pt-3 border-t border-slate-100">
                  <button
                    onClick={() => setIsDetailOpen(false)}
                    className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-850 text-white font-bold text-xs cursor-pointer"
                  >
                    Đóng
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

    </div>
  )
}

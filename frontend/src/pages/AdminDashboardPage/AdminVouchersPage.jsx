import { useState, useEffect } from 'react'
import { Search, Plus, Edit, Trash2, Ticket, Loader2, Info, X } from 'lucide-react'
import api from '../../services/api'

export default function AdminVouchersPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [vouchers, setVouchers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [limit] = useState(10)

  // Modal control states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentVoucher, setCurrentVoucher] = useState(null)
  const [modalLoading, setModalLoading] = useState(false)
  const [modalError, setModalError] = useState('')

  // Form states
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [discountType, setDiscountType] = useState('percentage')
  const [discountValue, setDiscountValue] = useState('')
  const [minOrderValue, setMinOrderValue] = useState('0')
  const [usageLimit, setUsageLimit] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [isActive, setIsActive] = useState(true)

  // Delete control states
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [voucherToDelete, setVoucherToDelete] = useState(null)

  const fetchVouchers = async () => {
    setLoading(true)
    try {
      const res = await api.get('admin/vouchers/', {
        params: {
          search: searchTerm,
          page: currentPage,
          limit: limit
        }
      })
      setVouchers(res.data.results || [])
      setTotalPages(res.data.total_pages || 1)
      setTotalCount(res.data.count || 0)
      setError('')
    } catch (err) {
      setError(err.response?.data?.error || 'Không tải được danh sách voucher.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVouchers()
  }, [searchTerm, currentPage])

  const handleOpenModal = (v = null) => {
    setCurrentVoucher(v)
    if (v) {
      setCode(v.code)
      setName(v.name)
      setDiscountType(v.discount_type)
      setDiscountValue(v.discount_value)
      setMinOrderValue(v.min_order_value)
      setUsageLimit(v.usage_limit || '')
      setStartDate(v.start_date)
      setEndDate(v.end_date)
      setIsActive(v.is_active)
    } else {
      setCode('')
      setName('')
      setDiscountType('percentage')
      setDiscountValue('')
      setMinOrderValue('0')
      setUsageLimit('')
      // Set defaults for dates: start today, end in 30 days
      const now = new Date()
      const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
      setStartDate(formatDateForInput(now))
      setEndDate(formatDateForInput(in30Days))
      setIsActive(true)
    }
    setModalError('')
    setIsModalOpen(true)
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault()
    if (!code || !name || !discountValue || !startDate || !endDate) {
      setModalError('Vui lòng điền đầy đủ các thông tin bắt buộc.')
      return
    }

    setModalLoading(true)
    setModalError('')

    const payload = {
      code,
      name,
      discount_type: discountType,
      discount_value: discountValue,
      min_order_value: minOrderValue,
      usage_limit: usageLimit ? Number(usageLimit) : null,
      start_date: startDate,
      end_date: endDate,
      is_active: isActive
    }

    try {
      if (currentVoucher) {
        // Edit mode
        await api.put(`admin/vouchers/${currentVoucher.id}/`, payload)
      } else {
        // Create mode
        await api.post('admin/vouchers/', payload)
      }
      setIsModalOpen(false)
      fetchVouchers()
    } catch (err) {
      setModalError(err.response?.data?.error || 'Có lỗi xảy ra khi lưu voucher.')
    } finally {
      setModalLoading(false)
    }
  }

  const handleConfirmDelete = (v) => {
    setVoucherToDelete(v)
    setDeleteConfirmOpen(true)
  }

  const handleDeleteSubmit = async () => {
    if (!voucherToDelete) return
    setLoading(true)
    try {
      await api.delete(`admin/vouchers/${voucherToDelete.id}/`)
      setDeleteConfirmOpen(false)
      setVoucherToDelete(null)
      fetchVouchers()
    } catch (err) {
      setError(err.response?.data?.error || 'Không thể xóa voucher.')
      setLoading(false)
    }
  }

  const startRange = totalCount > 0 ? (currentPage - 1) * limit + 1 : 0
  const endRange = Math.min(currentPage * limit, totalCount)
  const pageNumbers = []
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i)
  }

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  if (loading && vouchers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 min-h-[60vh]">
        <Loader2 className="animate-spin text-blue-600 mb-3" size={36} />
        <p className="text-slate-500 font-bold text-sm">Đang tải danh sách voucher...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Quản lý Voucher</h1>
          <p className="text-sm text-slate-500 mt-1">Cấu hình mã giảm giá, khuyến mãi cho khách hàng.</p>
        </div>
        <button 
          onClick={() => handleOpenModal(null)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-bold text-sm transition-colors shadow-sm cursor-pointer animate-slide-in"
        >
          <Plus size={18} /> Tạo mã mới
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Tìm mã voucher hoặc chương trình..." 
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
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-4 px-6">Mã Voucher</th>
                <th className="py-4 px-6">Chương trình</th>
                <th className="py-4 px-6">Mức giảm</th>
                <th className="py-4 px-6 text-center">Đã dùng</th>
                <th className="py-4 px-6">Hạn sử dụng</th>
                <th className="py-4 px-6">Trạng thái</th>
                <th className="py-4 px-6 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {vouchers.length > 0 ? (
                vouchers.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-6 font-black text-blue-600">
                      <div className="flex gap-2 items-center"><Ticket size={16}/> {v.code}</div>
                    </td>
                    <td className="py-3 px-6 text-sm font-semibold text-slate-700 max-w-[200px] truncate" title={v.name}>{v.name}</td>
                    <td className="py-3 px-6 text-sm text-green-600 font-bold">{v.discount_str}</td>
                    <td className="py-3 px-6 text-sm text-slate-600 text-center">
                      <span className="font-bold text-slate-800">{v.used_count}</span>
                      {v.usage_limit > 0 ? ` / ${v.usage_limit}` : ' (không giới hạn)'}
                    </td>
                    <td className="py-3 px-6 text-sm text-slate-500">{v.expires}</td>
                    <td className="py-3 px-6">
                      <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${v.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {v.status === 'active' ? 'Đang chạy' : 'Đã hết hạn / Khóa'}
                      </span>
                    </td>
                    <td className="py-3 px-6 text-right">
                      <div className="flex justify-end gap-1">
                        <button 
                          onClick={() => handleOpenModal(v)}
                          className="p-1.5 text-slate-400 hover:text-amber-600 rounded-lg hover:bg-amber-50 cursor-pointer"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => handleConfirmDelete(v)}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 cursor-pointer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-400 font-bold">Không tìm thấy voucher nào.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalCount > 0 && (
          <div className="px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-500">
              Hiển thị <span className="font-bold text-slate-800">{startRange}</span> đến <span className="font-bold text-slate-800">{endRange}</span> trong số <span className="font-bold text-slate-800">{totalCount}</span> voucher
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

      {/* ─── Add/Edit Voucher Modal ─── */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            
            {/* Header */}
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h2 className="text-xl font-black text-slate-800">
                {currentVoucher ? 'Cập nhật Voucher' : 'Tạo Voucher mới'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-650 hover:bg-slate-50 rounded-lg">
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleFormSubmit} className="space-y-4">
              {modalError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2 font-semibold">
                  <Info size={14} />
                  <span>{modalError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">Mã code voucher * (Ví dụ: WELCOME50)</label>
                  <input 
                    type="text" 
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 font-bold uppercase" 
                    value={code} 
                    onChange={e => setCode(e.target.value)} 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">Tên chương trình khuyến mãi *</label>
                  <input 
                    type="text" 
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500" 
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">Loại giảm giá</label>
                  <select 
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 cursor-pointer"
                    value={discountType}
                    onChange={e => setDiscountType(e.target.value)}
                  >
                    <option value="percentage">Phần trăm (%)</option>
                    <option value="fixed">Số tiền cố định (VND)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">Giá trị giảm giá *</label>
                  <input 
                    type="number" 
                    required
                    placeholder={discountType === 'percentage' ? 'Ví dụ: 10' : 'Ví dụ: 50000'}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500" 
                    value={discountValue} 
                    onChange={e => setDiscountValue(e.target.value)} 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">Đơn tối thiểu (VND)</label>
                  <input 
                    type="number" 
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500" 
                    value={minOrderValue} 
                    onChange={e => setMinOrderValue(e.target.value)} 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">Thời gian bắt đầu *</label>
                  <input 
                    type="datetime-local" 
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500" 
                    value={startDate} 
                    onChange={e => setStartDate(e.target.value)} 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">Thời gian kết thúc *</label>
                  <input 
                    type="datetime-local" 
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500" 
                    value={endDate} 
                    onChange={e => setEndDate(e.target.value)} 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">Giới hạn số lượt dùng (Trống = vô hạn)</label>
                  <input 
                    type="number" 
                    placeholder="Ví dụ: 100"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500" 
                    value={usageLimit} 
                    onChange={e => setUsageLimit(e.target.value)} 
                  />
                </div>
                <div className="flex items-center gap-2 pt-5">
                  <input 
                    type="checkbox" 
                    id="isActive"
                    className="rounded border-slate-350 text-blue-600 focus:ring-blue-500"
                    checked={isActive}
                    onChange={e => setIsActive(e.target.checked)}
                  />
                  <label htmlFor="isActive" className="text-xs font-bold text-slate-700 cursor-pointer select-none">Kích hoạt mã giảm giá</label>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button 
                  type="submit"
                  disabled={modalLoading}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-750 text-white font-bold text-xs shadow-sm cursor-pointer"
                >
                  {modalLoading && <Loader2 size={12} className="animate-spin" />}
                  <span>Lưu thông tin</span>
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
              <h3 className="font-bold text-slate-800 text-lg">Xác nhận xóa Voucher</h3>
              <p className="text-slate-500 text-sm mt-1">Bạn có chắc chắn muốn xóa vĩnh viễn voucher <b>{voucherToDelete?.code}</b>? Các đơn hàng đã dùng voucher này vẫn giữ nguyên lịch sử.</p>
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

    </div>
  )
}

function formatDateForInput(date) {
  const pad = (num) => String(num).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

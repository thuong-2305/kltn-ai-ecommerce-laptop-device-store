import { useState } from 'react'
import { Search, Filter, Eye, Edit, Trash2, Download } from 'lucide-react'

const MOCK_ORDERS = [
  { id: '#TZ1056', customer: 'Nguyễn Văn A', phone: '0901234567', total: '32.990.000 đ', payment: 'Đã thanh toán', pStatus: 'paid', status: 'Đang giao', sStatus: 'shipping', date: '23/05/2025 14:23' },
  { id: '#TZ1055', customer: 'Trần Thị B', phone: '0912345678', total: '18.490.000 đ', payment: 'Đã thanh toán', pStatus: 'paid', status: 'Đã giao', sStatus: 'completed', date: '23/05/2025 13:15' },
  { id: '#TZ1054', customer: 'Lê Văn C', phone: '0923456789', total: '45.990.000 đ', payment: 'Chưa thanh toán', pStatus: 'unpaid', status: 'Chờ xác nhận', sStatus: 'pending', date: '23/05/2025 11:48' },
  { id: '#TZ1053', customer: 'Phạm Quốc D', phone: '0934567890', total: '22.990.000 đ', payment: 'Đã thanh toán', pStatus: 'paid', status: 'Đang giao', sStatus: 'shipping', date: '22/05/2025 16:30' },
  { id: '#TZ1052', customer: 'Hoàng Minh E', phone: '0945678901', total: '9.990.000 đ', payment: 'Đã thanh toán', pStatus: 'paid', status: 'Đã hủy', sStatus: 'cancelled', date: '22/05/2025 10:05' },
]

const STATUS_CFG = {
  paid: 'bg-green-100 text-green-700',
  unpaid: 'bg-amber-100 text-amber-700',
  shipping: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  pending: 'bg-amber-100 text-amber-700',
  cancelled: 'bg-red-100 text-red-700',
}

export default function AdminOrdersPage() {
  const [searchTerm, setSearchTerm] = useState('')

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Quản lý Đơn hàng</h1>
          <p className="text-sm text-slate-500 mt-1">Theo dõi, xử lý và cập nhật trạng thái đơn hàng.</p>
        </div>
        <button className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-4 py-2.5 rounded-xl font-bold text-sm transition-colors shadow-sm">
          <Download size={18} />
          Xuất Excel
        </button>
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
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-4">
          <select className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-700 outline-none focus:border-blue-500 transition-colors cursor-pointer">
            <option value="">Trạng thái: Tất cả</option>
            <option value="pending">Chờ xác nhận</option>
            <option value="shipping">Đang giao</option>
            <option value="completed">Đã giao</option>
            <option value="cancelled">Đã hủy</option>
          </select>
          <button className="flex items-center gap-2 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 px-4 py-2.5 rounded-xl font-medium text-sm transition-colors">
            <Filter size={16} />
            Bộ lọc nâng cao
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-4 px-6 w-12">
                  <input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                </th>
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
              {MOCK_ORDERS.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="py-3 px-6">
                    <input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                  </td>
                  <td className="py-3 px-6 font-bold text-blue-600 hover:underline cursor-pointer">{order.id}</td>
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
                      <button className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors tooltip-trigger" title="Xem chi tiết">
                        <Eye size={16} />
                      </button>
                      <button className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors tooltip-trigger" title="Cập nhật">
                        <Edit size={16} />
                      </button>
                      <button className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors tooltip-trigger" title="Xóa">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
          <p className="text-sm text-slate-500">Hiển thị <span className="font-bold text-slate-800">1</span> đến <span className="font-bold text-slate-800">5</span> trong số <span className="font-bold text-slate-800">2,845</span> đơn hàng</p>
          <div className="flex gap-1">
            <button className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 disabled:opacity-50">Trước</button>
            <button className="px-3 py-1.5 rounded-lg border border-blue-600 bg-blue-600 text-white text-sm font-medium">1</button>
            <button className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50">2</button>
            <button className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50">3</button>
            <span className="px-2 py-1.5 text-slate-400">...</span>
            <button className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 disabled:opacity-50">Sau</button>
          </div>
        </div>
      </div>

    </div>
  )
}

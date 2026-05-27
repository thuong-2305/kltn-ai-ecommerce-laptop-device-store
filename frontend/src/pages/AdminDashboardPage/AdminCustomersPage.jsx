import { useState } from 'react'
import { Search, Filter, Eye, Edit, Trash2, Plus, Mail } from 'lucide-react'

const MOCK_CUSTOMERS = [
  { id: 'KH001', name: 'Nguyễn Văn A', email: 'nguyenvana@gmail.com', phone: '0901234567', totalOrders: 15, totalSpent: '150.000.000 đ', status: 'active', avatar: 'https://i.pravatar.cc/150?u=KH001' },
  { id: 'KH002', name: 'Trần Thị B', email: 'tranthib@gmail.com', phone: '0912345678', totalOrders: 3, totalSpent: '18.490.000 đ', status: 'active', avatar: 'https://i.pravatar.cc/150?u=KH002' },
  { id: 'KH003', name: 'Lê Văn C', email: 'levanc@gmail.com', phone: '0923456789', totalOrders: 0, totalSpent: '0 đ', status: 'inactive', avatar: 'https://i.pravatar.cc/150?u=KH003' },
  { id: 'KH004', name: 'Phạm Quốc D', email: 'phamquocd@gmail.com', phone: '0934567890', totalOrders: 5, totalSpent: '45.990.000 đ', status: 'active', avatar: 'https://i.pravatar.cc/150?u=KH004' },
  { id: 'KH005', name: 'Hoàng Minh E', email: 'hoangminhe@gmail.com', phone: '0945678901', totalOrders: 1, totalSpent: '9.990.000 đ', status: 'banned', avatar: 'https://i.pravatar.cc/150?u=KH005' },
]

const STATUS_CFG = {
  active: { label: 'Hoạt động', cls: 'bg-green-100 text-green-700' },
  inactive: { label: 'Không HĐ', cls: 'bg-slate-100 text-slate-700' },
  banned: { label: 'Bị khóa', cls: 'bg-red-100 text-red-700' },
}

export default function AdminCustomersPage() {
  const [searchTerm, setSearchTerm] = useState('')

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Quản lý Khách hàng</h1>
          <p className="text-sm text-slate-500 mt-1">Quản lý thông tin, lịch sử mua hàng và tài khoản người dùng.</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-bold text-sm transition-colors shadow-sm shadow-blue-600/20">
          <Plus size={18} />
          Thêm khách hàng
        </button>
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
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-4">
          <select className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-700 outline-none focus:border-blue-500 transition-colors cursor-pointer">
            <option value="">Tất cả trạng thái</option>
            <option value="active">Hoạt động</option>
            <option value="inactive">Không HĐ</option>
            <option value="banned">Bị khóa</option>
          </select>
          <button className="flex items-center gap-2 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 px-4 py-2.5 rounded-xl font-medium text-sm transition-colors">
            <Filter size={16} />
            Lọc nâng cao
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
                <th className="py-4 px-6">Khách hàng</th>
                <th className="py-4 px-6">Số điện thoại</th>
                <th className="py-4 px-6 text-center">Đơn hàng</th>
                <th className="py-4 px-6 text-right">Tổng chi tiêu</th>
                <th className="py-4 px-6 text-center">Trạng thái</th>
                <th className="py-4 px-6 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {MOCK_CUSTOMERS.map((cust) => {
                const cfg = STATUS_CFG[cust.status]
                return (
                  <tr key={cust.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="py-3 px-6">
                      <input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                    </td>
                    <td className="py-3 px-6">
                      <div className="flex items-center gap-3">
                        <img src={cust.avatar} alt={cust.name} className="w-10 h-10 rounded-full bg-slate-200 object-cover" />
                        <div>
                          <p className="font-bold text-slate-800 text-sm group-hover:text-blue-600 transition-colors cursor-pointer">{cust.name}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{cust.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-6 text-sm text-slate-600 font-medium">{cust.phone}</td>
                    <td className="py-3 px-6 text-sm text-center font-bold text-slate-700">{cust.totalOrders}</td>
                    <td className="py-3 px-6 text-sm text-right font-black text-blue-600">{cust.totalSpent}</td>
                    <td className="py-3 px-6 text-center">
                      <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold inline-block ${cfg.cls}`}>
                        {cfg.label}
                      </span>
                    </td>
                    <td className="py-3 px-6 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors tooltip-trigger" title="Gửi Email">
                          <Mail size={16} />
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
                )
              })}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
          <p className="text-sm text-slate-500">Hiển thị <span className="font-bold text-slate-800">1</span> đến <span className="font-bold text-slate-800">5</span> trong số <span className="font-bold text-slate-800">12,450</span> khách hàng</p>
          <div className="flex gap-1">
            <button className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 disabled:opacity-50">Trước</button>
            <button className="px-3 py-1.5 rounded-lg border border-blue-600 bg-blue-600 text-white text-sm font-medium">1</button>
            <button className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50">2</button>
            <span className="px-2 py-1.5 text-slate-400">...</span>
            <button className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 disabled:opacity-50">Sau</button>
          </div>
        </div>
      </div>

    </div>
  )
}

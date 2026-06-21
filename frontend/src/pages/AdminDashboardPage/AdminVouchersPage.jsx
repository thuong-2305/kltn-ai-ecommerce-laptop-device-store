import { useState } from 'react'
import { Search, Plus, Edit, Trash2, Ticket } from 'lucide-react'

const MOCK_VOUCHERS = [
  { id: 'WELCOME50', name: 'Giảm 50K cho KH mới', discount: '50.000 đ', minOrder: '200.000 đ', used: '12/100', expires: '31/12/2026', status: 'active' },
  { id: 'FREESHIP', name: 'Miễn phí vận chuyển', discount: 'Tối đa 30K', minOrder: '0 đ', used: '450/1000', expires: 'Hết hôm nay', status: 'active' },
  { id: 'FLASH10', name: 'Flash Sale -10%', discount: '10%', minOrder: '1.000.000 đ', used: '50/50', expires: '10/05/2026', status: 'expired' },
]

export default function AdminVouchersPage() {
  const [searchTerm, setSearchTerm] = useState('')

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Quản lý Voucher</h1>
          <p className="text-sm text-slate-500 mt-1">Cấu hình mã giảm giá, khuyến mãi cho khách hàng.</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-sm">
          <Plus size={18} /> Tạo mã mới
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input type="text" placeholder="Tìm mã voucher..." className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-4 px-6">Mã Voucher</th>
              <th className="py-4 px-6">Chương trình</th>
              <th className="py-4 px-6">Mức giảm</th>
              <th className="py-4 px-6">Đã dùng</th>
              <th className="py-4 px-6">Hạn sử dụng</th>
              <th className="py-4 px-6">Trạng thái</th>
              <th className="py-4 px-6 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {MOCK_VOUCHERS.map((v) => (
              <tr key={v.id} className="hover:bg-slate-50/50">
                <td className="py-3 px-6 font-black text-blue-600"><div className="flex gap-2 items-center"><Ticket size={16}/> {v.id}</div></td>
                <td className="py-3 px-6 text-sm font-semibold text-slate-700">{v.name}</td>
                <td className="py-3 px-6 text-sm text-green-600 font-bold">{v.discount}</td>
                <td className="py-3 px-6 text-sm text-slate-600">{v.used}</td>
                <td className="py-3 px-6 text-sm text-slate-500">{v.expires}</td>
                <td className="py-3 px-6">
                  <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${v.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {v.status === 'active' ? 'Đang chạy' : 'Đã hết hạn'}
                  </span>
                </td>
                <td className="py-3 px-6 text-right">
                  <div className="flex justify-end gap-1">
                    <button className="p-1.5 text-slate-400 hover:text-amber-600 rounded-lg"><Edit size={16} /></button>
                    <button className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

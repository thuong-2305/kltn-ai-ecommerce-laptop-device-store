import { useState } from 'react'
import { Search, Plus, Edit, Trash2, ShieldCheck } from 'lucide-react'

const MOCK_USERS = [
  { id: 'U001', name: 'Admin TechZone', email: 'admin@techzone.vn', role: 'Quản trị viên', status: 'active', avatar: 'https://i.pravatar.cc/150?u=admin' },
  { id: 'U002', name: 'Nguyễn Kế Toán', email: 'ketoan@techzone.vn', role: 'Kế toán', status: 'active', avatar: 'https://i.pravatar.cc/150?u=ketoan' },
  { id: 'U003', name: 'Trần Bán Hàng', email: 'banhang@techzone.vn', role: 'Nhân viên Bán hàng', status: 'active', avatar: 'https://i.pravatar.cc/150?u=banhang' },
  { id: 'U004', name: 'Lê Kho', email: 'kho@techzone.vn', role: 'Quản lý kho', status: 'inactive', avatar: 'https://i.pravatar.cc/150?u=kho' },
]

export default function AdminUsersPage() {
  const [searchTerm, setSearchTerm] = useState('')

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Người dùng nội bộ</h1>
          <p className="text-sm text-slate-500 mt-1">Quản lý tài khoản nhân viên và quyền truy cập hệ thống.</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-bold text-sm">
          <Plus size={18} /> Thêm nhân viên
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input type="text" placeholder="Tìm kiếm nhân viên..." className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-4 px-6">Nhân viên</th>
              <th className="py-4 px-6">Email</th>
              <th className="py-4 px-6">Vai trò</th>
              <th className="py-4 px-6">Trạng thái</th>
              <th className="py-4 px-6 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {MOCK_USERS.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50/50">
                <td className="py-3 px-6">
                  <div className="flex items-center gap-3">
                    <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
                    <span className="font-bold text-slate-800 text-sm">{user.name}</span>
                  </div>
                </td>
                <td className="py-3 px-6 text-sm text-slate-600">{user.email}</td>
                <td className="py-3 px-6">
                  <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold inline-flex items-center gap-1 ${user.role === 'Quản trị viên' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                    {user.role === 'Quản trị viên' && <ShieldCheck size={12}/>}
                    {user.role}
                  </span>
                </td>
                <td className="py-3 px-6">
                  <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${user.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}`}>
                    {user.status === 'active' ? 'Hoạt động' : 'Tạm khóa'}
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

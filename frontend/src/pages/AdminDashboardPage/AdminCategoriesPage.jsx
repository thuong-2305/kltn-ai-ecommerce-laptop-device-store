import { useState } from 'react'
import { Search, Plus, Edit, Trash2, Tag } from 'lucide-react'

const MOCK_CATEGORIES = [
  { id: 'CAT01', name: 'Laptop Gaming', slug: 'laptop-gaming', count: 45, status: 'active' },
  { id: 'CAT02', name: 'MacBook', slug: 'macbook', count: 12, status: 'active' },
  { id: 'CAT03', name: 'Màn hình', slug: 'man-hinh', count: 28, status: 'active' },
  { id: 'CAT04', name: 'Bàn phím cơ', slug: 'ban-phim-co', count: 15, status: 'hidden' },
  { id: 'CAT05', name: 'Chuột máy tính', slug: 'chuot-may-tinh', count: 30, status: 'active' },
]

export default function AdminCategoriesPage() {
  const [searchTerm, setSearchTerm] = useState('')

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Danh mục sản phẩm</h1>
          <p className="text-sm text-slate-500 mt-1">Quản lý và phân loại các mặt hàng trên cửa hàng.</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-bold text-sm transition-colors shadow-sm shadow-blue-600/20">
          <Plus size={18} /> Thêm danh mục
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input type="text" placeholder="Tìm kiếm danh mục..." className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 transition-colors" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-4 px-6 w-12"><input type="checkbox" className="rounded border-slate-300 text-blue-600" /></th>
              <th className="py-4 px-6">Danh mục</th>
              <th className="py-4 px-6">Đường dẫn (Slug)</th>
              <th className="py-4 px-6 text-center">Số sản phẩm</th>
              <th className="py-4 px-6">Trạng thái</th>
              <th className="py-4 px-6 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {MOCK_CATEGORIES.map((cat) => (
              <tr key={cat.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="py-3 px-6"><input type="checkbox" className="rounded border-slate-300 text-blue-600" /></td>
                <td className="py-3 px-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center"><Tag size={18} /></div>
                    <span className="font-bold text-slate-800">{cat.name}</span>
                  </div>
                </td>
                <td className="py-3 px-6 text-sm text-slate-500">/{cat.slug}</td>
                <td className="py-3 px-6 text-sm font-bold text-slate-700 text-center">{cat.count}</td>
                <td className="py-3 px-6">
                  <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${cat.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}`}>
                    {cat.status === 'active' ? 'Hiển thị' : 'Đang ẩn'}
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

import { useState } from 'react'
import { Plus, Search, Filter, Edit, Trash2, Eye, MoreVertical } from 'lucide-react'

const MOCK_PRODUCTS = [
  { id: 'SP001', name: 'Laptop ASUS ROG Strix G16', category: 'Laptop Gaming', price: '32.990.000 đ', stock: 45, status: 'active', img: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=50&h=50&fit=crop' },
  { id: 'SP002', name: 'MacBook Air M2 2022', category: 'MacBook', price: '24.590.000 đ', stock: 12, status: 'active', img: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=50&h=50&fit=crop' },
  { id: 'SP003', name: 'Bàn phím cơ Keychron K8', category: 'Phụ kiện', price: '1.890.000 đ', stock: 0, status: 'out_of_stock', img: 'https://images.unsplash.com/photo-1595225476474-87563907a212?w=50&h=50&fit=crop' },
  { id: 'SP004', name: 'Chuột Logitech G Pro X', category: 'Phụ kiện', price: '2.490.000 đ', stock: 150, status: 'active', img: 'https://images.unsplash.com/photo-1527814050087-179f00222cb8?w=50&h=50&fit=crop' },
  { id: 'SP005', name: 'Màn hình Dell UltraSharp 27', category: 'Màn hình', price: '11.990.000 đ', stock: 8, status: 'hidden', img: 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=50&h=50&fit=crop' },
]

const STATUS_CONFIG = {
  active: { label: 'Đang bán', cls: 'bg-green-100 text-green-700' },
  out_of_stock: { label: 'Hết hàng', cls: 'bg-red-100 text-red-700' },
  hidden: { label: 'Đang ẩn', cls: 'bg-slate-100 text-slate-700' },
}

export default function AdminProductsPage() {
  const [searchTerm, setSearchTerm] = useState('')

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Quản lý Sản phẩm</h1>
          <p className="text-sm text-slate-500 mt-1">Quản lý danh sách sản phẩm, giá bán và tồn kho.</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-bold text-sm transition-colors shadow-sm shadow-blue-600/20">
          <Plus size={18} />
          Thêm sản phẩm mới
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Tìm kiếm theo tên, mã sản phẩm..." 
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:bg-white transition-colors"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-4">
          <select className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-700 outline-none focus:border-blue-500 transition-colors cursor-pointer">
            <option value="">Tất cả danh mục</option>
            <option value="laptop">Laptop Gaming</option>
            <option value="macbook">MacBook</option>
            <option value="accessories">Phụ kiện</option>
          </select>
          <button className="flex items-center gap-2 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 px-4 py-2.5 rounded-xl font-medium text-sm transition-colors">
            <Filter size={16} />
            Bộ lọc
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
                <th className="py-4 px-6">Sản phẩm</th>
                <th className="py-4 px-6">Danh mục</th>
                <th className="py-4 px-6">Giá bán</th>
                <th className="py-4 px-6">Tồn kho</th>
                <th className="py-4 px-6">Trạng thái</th>
                <th className="py-4 px-6 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {MOCK_PRODUCTS.map((prod) => {
                const cfg = STATUS_CONFIG[prod.status]
                return (
                  <tr key={prod.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="py-3 px-6">
                      <input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                    </td>
                    <td className="py-3 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg border border-slate-200 bg-white overflow-hidden shrink-0">
                          <img src={prod.img} alt={prod.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-sm group-hover:text-blue-600 transition-colors cursor-pointer">{prod.name}</p>
                          <p className="text-xs text-slate-500 mt-0.5">Mã: {prod.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-6 text-sm text-slate-600">{prod.category}</td>
                    <td className="py-3 px-6 text-sm font-bold text-slate-800">{prod.price}</td>
                    <td className="py-3 px-6 text-sm text-slate-600">
                      {prod.stock > 0 ? (
                        <span>{prod.stock}</span>
                      ) : (
                        <span className="text-red-500 font-semibold">0</span>
                      )}
                    </td>
                    <td className="py-3 px-6">
                      <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${cfg.cls}`}>
                        {cfg.label}
                      </span>
                    </td>
                    <td className="py-3 px-6 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors tooltip-trigger" title="Xem">
                          <Eye size={16} />
                        </button>
                        <button className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors tooltip-trigger" title="Sửa">
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
          <p className="text-sm text-slate-500">Hiển thị <span className="font-bold text-slate-800">1</span> đến <span className="font-bold text-slate-800">5</span> trong số <span className="font-bold text-slate-800">532</span> sản phẩm</p>
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

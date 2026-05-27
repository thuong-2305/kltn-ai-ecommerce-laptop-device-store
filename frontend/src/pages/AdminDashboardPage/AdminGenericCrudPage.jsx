import { useState } from 'react'
import { Search, Plus, Settings } from 'lucide-react'
import { useLocation } from 'react-router-dom'

export default function AdminGenericCrudPage() {
  const location = useLocation()
  const path = location.pathname.split('/').pop()
  
  // Basic mapping to show a relevant title based on URL path
  const titles = {
    categories: 'Quản lý Danh mục',
    vouchers: 'Quản lý Voucher',
    revenue: 'Báo cáo doanh thu',
    posts: 'Quản lý Bài viết',
    pages: 'Quản lý Trang',
    comments: 'Quản lý Bình luận',
    'post-categories': 'Danh mục Bài viết',
    users: 'Quản lý Người dùng',
    roles: 'Vai trò & Quyền',
    settings: 'Cài đặt Hệ thống',
    activity: 'Nhật ký Hoạt động'
  }

  const title = titles[path] || 'Trang Quản lý'

  return (
    <div className="space-y-6 animate-in fade-in duration-500 flex flex-col h-[80vh]">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800">{title}</h1>
          <p className="text-sm text-slate-500 mt-1">Đang xây dựng và phát triển chức năng này.</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-bold text-sm transition-colors shadow-sm shadow-blue-600/20">
          <Plus size={18} />
          Thêm mới
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Tìm kiếm..." 
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:bg-white transition-colors"
          />
        </div>
      </div>

      {/* Empty State */}
      <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center p-8 text-center">
        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
          <Settings size={32} className="text-slate-400 animate-[spin_4s_linear_infinite]" />
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-2">Chức năng đang phát triển</h3>
        <p className="text-slate-500 max-w-sm mb-6">Tính năng quản lý cho tab <b>{title}</b> đang trong quá trình hoàn thiện và sẽ sớm ra mắt ở phiên bản tiếp theo.</p>
        <button className="bg-slate-100 text-slate-700 px-6 py-2 rounded-xl font-bold text-sm hover:bg-slate-200 transition-colors">
          Quay lại tổng quan
        </button>
      </div>

    </div>
  )
}

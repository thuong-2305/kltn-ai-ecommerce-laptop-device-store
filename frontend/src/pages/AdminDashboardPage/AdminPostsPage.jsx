import { useState } from 'react'
import { Search, Plus, Edit, Trash2 } from 'lucide-react'

const MOCK_POSTS = [
  { id: 1, title: 'Đánh giá chi tiết MacBook Air M2', category: 'Review', views: 1205, date: '20/05/2026', status: 'published', img: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=100&h=60&fit=crop' },
  { id: 2, title: 'Top 5 Laptop Gaming đáng mua nhất 2026', category: 'Kinh nghiệm', views: 3402, date: '15/05/2026', status: 'published', img: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=100&h=60&fit=crop' },
  { id: 3, title: 'Cách vệ sinh bàn phím cơ đúng cách', category: 'Thủ thuật', views: 0, date: '-', status: 'draft', img: 'https://images.unsplash.com/photo-1595225476474-87563907a212?w=100&h=60&fit=crop' },
]

export default function AdminPostsPage() {
  const [searchTerm, setSearchTerm] = useState('')

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Bài viết</h1>
          <p className="text-sm text-slate-500 mt-1">Quản lý tin tức, blog và nội dung truyền thông.</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-bold text-sm">
          <Plus size={18} /> Viết bài mới
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input type="text" placeholder="Tìm kiếm bài viết..." className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-4 px-6">Bài viết</th>
              <th className="py-4 px-6">Chuyên mục</th>
              <th className="py-4 px-6 text-center">Lượt xem</th>
              <th className="py-4 px-6">Ngày đăng</th>
              <th className="py-4 px-6">Trạng thái</th>
              <th className="py-4 px-6 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {MOCK_POSTS.map((post) => (
              <tr key={post.id} className="hover:bg-slate-50/50">
                <td className="py-3 px-6">
                  <div className="flex items-center gap-3">
                    <img src={post.img} alt={post.title} className="w-16 h-10 rounded-md object-cover border border-slate-200" />
                    <span className="font-bold text-slate-800 text-sm max-w-xs truncate">{post.title}</span>
                  </div>
                </td>
                <td className="py-3 px-6 text-sm text-slate-600">{post.category}</td>
                <td className="py-3 px-6 text-sm font-semibold text-slate-700 text-center">{post.views}</td>
                <td className="py-3 px-6 text-sm text-slate-500">{post.date}</td>
                <td className="py-3 px-6">
                  <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${post.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}`}>
                    {post.status === 'published' ? 'Đã xuất bản' : 'Bản nháp'}
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

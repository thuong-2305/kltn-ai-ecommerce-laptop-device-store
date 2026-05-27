import { useState } from 'react'
import { Search, CheckCircle2, XCircle, Trash2 } from 'lucide-react'

const MOCK_COMMENTS = [
  { id: 1, user: 'Nguyễn Văn A', content: 'Sản phẩm dùng rất mượt, giao hàng nhanh chóng.', target: 'Laptop ASUS ROG', time: '10 phút trước', status: 'approved' },
  { id: 2, user: 'Trần B', content: 'Có mẫu màu trắng không shop?', target: 'MacBook Air M2', time: '1 giờ trước', status: 'pending' },
  { id: 3, user: 'Spammer123', content: 'Click link để nhận thưởng http://spam.xyz', target: 'Đánh giá MacBook', time: '3 giờ trước', status: 'spam' },
]

export default function AdminCommentsPage() {
  const [searchTerm, setSearchTerm] = useState('')

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Quản lý Bình luận</h1>
          <p className="text-sm text-slate-500 mt-1">Duyệt, trả lời và quản lý đánh giá của khách hàng.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input type="text" placeholder="Tìm kiếm nội dung..." className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-4 px-6">Người dùng</th>
              <th className="py-4 px-6">Nội dung</th>
              <th className="py-4 px-6">Bài viết / Sản phẩm</th>
              <th className="py-4 px-6">Thời gian</th>
              <th className="py-4 px-6">Trạng thái</th>
              <th className="py-4 px-6 text-right">Duyệt</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {MOCK_COMMENTS.map((cmt) => (
              <tr key={cmt.id} className="hover:bg-slate-50/50">
                <td className="py-3 px-6 font-semibold text-slate-800 text-sm">{cmt.user}</td>
                <td className="py-3 px-6 text-sm text-slate-600 max-w-xs truncate" title={cmt.content}>{cmt.content}</td>
                <td className="py-3 px-6 text-sm font-medium text-blue-600 cursor-pointer hover:underline">{cmt.target}</td>
                <td className="py-3 px-6 text-sm text-slate-500">{cmt.time}</td>
                <td className="py-3 px-6">
                  <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${cmt.status === 'approved' ? 'bg-green-100 text-green-700' : cmt.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                    {cmt.status === 'approved' ? 'Đã duyệt' : cmt.status === 'pending' ? 'Chờ duyệt' : 'Spam'}
                  </span>
                </td>
                <td className="py-3 px-6 text-right">
                  <div className="flex justify-end gap-1">
                    {cmt.status === 'pending' && <button className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg"><CheckCircle2 size={18} /></button>}
                    {cmt.status === 'pending' && <button className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"><XCircle size={18} /></button>}
                    <button className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
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

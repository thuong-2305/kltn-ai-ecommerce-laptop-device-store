import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, CheckCircle2, XCircle, Trash2, Loader2, Info } from 'lucide-react'
import api from '../../services/api'

export default function AdminCommentsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchComments = async () => {
      setLoading(true)
      try {
        const res = await api.get('admin/reviews/')
        setComments(res.data.reviews || [])
        setError('')
      } catch (err) {
        setError(err.response?.data?.error || 'Không tải được danh sách bình luận.')
      } finally {
        setLoading(false)
      }
    }
    fetchComments()
  }, [])

  const filteredComments = comments.filter((cmt) => 
    (cmt.user || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (cmt.content || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (cmt.target || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="animate-spin text-blue-600" size={32} />
        <p className="text-slate-500 text-sm mt-3 font-semibold">Đang tải danh sách bình luận...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 text-red-700 rounded-2xl flex items-center gap-3">
        <Info size={20} />
        <p className="font-semibold">{error}</p>
      </div>
    )
  }

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
        {filteredComments.length > 0 ? (
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-4 px-6">Người dùng</th>
                <th className="py-4 px-6">Nội dung</th>
                <th className="py-4 px-6">Đánh giá</th>
                <th className="py-4 px-6">Bài viết / Sản phẩm</th>
                <th className="py-4 px-6">Thời gian</th>
                <th className="py-4 px-6">Cảm xúc</th>
                <th className="py-4 px-6">Trạng thái</th>
                <th className="py-4 px-6 text-right">Duyệt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredComments.map((cmt) => (
                <tr key={cmt.id} className="hover:bg-slate-50/50">
                  <td className="py-3 px-6 font-semibold text-slate-800 text-sm">{cmt.user}</td>
                  <td className="py-3 px-6 text-sm text-slate-600 max-w-xs truncate" title={cmt.content}>{cmt.content}</td>
                  <td className="py-3 px-6 text-sm font-bold text-yellow-500">{cmt.rating} ⭐</td>
                  <td className="py-3 px-6 text-sm font-semibold">
                    <Link to={`/ai-sentiment/${cmt.product_id}`} className="text-blue-600 hover:underline">
                      {cmt.target}
                    </Link>
                  </td>
                  <td className="py-3 px-6 text-sm text-slate-500">{cmt.time}</td>
                  <td className="py-3 px-6 text-xs font-bold">
                    <span className={`px-2 py-0.5 rounded-full border ${
                      cmt.sentiment === 'positive' ? 'bg-green-50 border-green-200 text-green-700' :
                      cmt.sentiment === 'negative' ? 'bg-red-50 border-red-200 text-red-700' :
                      'bg-slate-50 border-slate-200 text-slate-600'
                    }`}>
                      {cmt.sentiment === 'positive' ? 'Tích cực' : cmt.sentiment === 'negative' ? 'Tiêu cực' : 'Trung lập'}
                    </span>
                  </td>
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
        ) : (
          <div className="p-8 text-center text-slate-500 font-medium">Không tìm thấy bình luận nào.</div>
        )}
      </div>
    </div>
  )
}

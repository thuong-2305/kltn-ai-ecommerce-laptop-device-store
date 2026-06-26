import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, CheckCircle2, XCircle, Trash2, Loader2, Info } from 'lucide-react'
import api from '../../services/api'

export default function AdminCommentsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [statusFilter, setStatusFilter] = useState('all') // all, approved, spam

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [limit] = useState(10)

  const fetchComments = async () => {
    setLoading(true)
    try {
      const res = await api.get('admin/reviews/', {
        params: {
          search: searchTerm,
          status: statusFilter,
          page: currentPage,
          limit: limit
        }
      })
      setComments(res.data.results || [])
      setTotalPages(res.data.total_pages || 1)
      setTotalCount(res.data.count || 0)
      setError('')
    } catch (err) {
      setError(err.response?.data?.error || 'Không tải được danh sách bình luận.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchComments()
  }, [searchTerm, statusFilter, currentPage])

  const handleToggleSpam = async (id, isSpamVal) => {
    try {
      await api.put(`admin/reviews/${id}/`, { is_spam: isSpamVal })
      // Update local state directly for speed
      setComments(prev => 
        prev.map(c => c.id === id ? { ...c, status: isSpamVal ? 'spam' : 'approved' } : c)
      )
    } catch (err) {
      alert('Không thể cập nhật trạng thái bình luận.')
    }
  }

  const handleDeleteComment = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa vĩnh viễn bình luận này khỏi hệ thống?')) return
    try {
      await api.delete(`admin/reviews/${id}/`)
      // Refresh to update count and get next page items
      fetchComments()
    } catch (err) {
      alert('Không thể xóa bình luận.')
    }
  }

  const startRange = totalCount > 0 ? (currentPage - 1) * limit + 1 : 0
  const endRange = Math.min(currentPage * limit, totalCount)
  const pageNumbers = []
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i)
  }

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  if (loading && comments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="animate-spin text-blue-600 animate-[spin_1.5s_linear_infinite]" size={32} />
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
          <p className="text-sm text-slate-500 mt-1">Duyệt, lọc spam và quản lý các đánh giá sản phẩm của khách hàng.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Tìm kiếm nội dung..." 
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500" 
            value={searchTerm} 
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1)
            }} 
          />
        </div>
        <div className="relative w-full sm:w-auto shrink-0">
          <select 
            className="w-full sm:w-48 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500 font-semibold cursor-pointer"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value)
              setCurrentPage(1)
            }}
          >
            <option value="all">Tất cả bình luận</option>
            <option value="approved">Đã duyệt (Hợp lệ)</option>
            <option value="spam">Spam (Bị AI chặn)</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-w-0">
        {comments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-4 px-6">Người dùng</th>
                  <th className="py-4 px-6">Nội dung</th>
                  <th className="py-4 px-6">Đánh giá</th>
                  <th className="py-4 px-6">Sản phẩm</th>
                  <th className="py-4 px-6">Thời gian</th>
                  <th className="py-4 px-6">Cảm xúc</th>
                  <th className="py-4 px-6">Trạng thái</th>
                  <th className="py-4 px-6 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {comments.map((cmt) => (
                  <tr key={cmt.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-6 font-semibold text-slate-800 text-sm">{cmt.user}</td>
                    <td className="py-3 px-6 text-sm text-slate-600 max-w-xs truncate" title={cmt.content}>{cmt.content}</td>
                    <td className="py-3 px-6 text-sm font-bold text-yellow-500">{cmt.rating} ⭐</td>
                    <td className="py-3 px-6 text-sm font-semibold">
                      <Link to={`/products/${cmt.product_id}`} className="text-blue-600 hover:underline">
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
                        {cmt.sentiment === 'positive' ? 'Tích cóc' : cmt.sentiment === 'negative' ? 'Tiêu cực' : 'Trung lập'}
                      </span>
                    </td>
                    <td className="py-3 px-6">
                      <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${cmt.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {cmt.status === 'approved' ? 'Hợp lệ' : 'Spam'}
                      </span>
                    </td>
                    <td className="py-3 px-6 text-right">
                      <div className="flex justify-end gap-1">
                        {cmt.status === 'spam' ? (
                          <button 
                            onClick={() => handleToggleSpam(cmt.id, false)}
                            className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg cursor-pointer"
                            title="Duyệt hợp lệ (Bỏ spam)"
                          >
                            <CheckCircle2 size={18} />
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleToggleSpam(cmt.id, true)}
                            className="p-1.5 text-red-655 hover:bg-red-50 rounded-lg cursor-pointer"
                            title="Đánh dấu Spam"
                          >
                            <XCircle size={18} />
                          </button>
                        )}
                        <button 
                          onClick={() => handleDeleteComment(cmt.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                          title="Xóa bình luận"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-slate-500 font-medium">Không tìm thấy bình luận nào.</div>
        )}

        {/* Pagination Footer */}
        {totalCount > 0 && (
          <div className="px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-500">
              Hiển thị <span className="font-bold text-slate-800">{startRange}</span> đến <span className="font-bold text-slate-800">{endRange}</span> trong số <span className="font-bold text-slate-800">{totalCount}</span> bình luận
            </p>
            <div className="flex gap-1">
              <button 
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-650 text-sm font-medium hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
              >
                Trước
              </button>
              {pageNumbers.map(num => (
                <button 
                  key={num}
                  onClick={() => handlePageChange(num)}
                  className={`px-3 py-1.5 rounded-lg border text-sm font-medium cursor-pointer ${
                    currentPage === num 
                      ? 'border-blue-600 bg-blue-600 text-white font-bold' 
                      : 'border-slate-200 text-slate-650 hover:bg-slate-50'
                  }`}
                >
                  {num}
                </button>
              ))}
              <button 
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-650 text-sm font-medium hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

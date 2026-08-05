import { useState, useEffect } from 'react'
import { Search, Edit, Trash2, ShieldCheck, Loader2, Info, X } from 'lucide-react'
import api from '../../services/api'

export default function AdminUsersPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('') // all, staff, client
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [limit] = useState(10)

  // Edit modal states
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [userToEdit, setUserToEdit] = useState(null)
  const [editIsStaff, setEditIsStaff] = useState(false)
  const [editIsActive, setEditIsActive] = useState(true)
  const [editLoading, setEditLoading] = useState(false)

  // Delete states
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState(null)

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const params = {
        search: searchTerm,
        page: currentPage,
        limit: limit
      }
      if (roleFilter === 'staff') {
        params.is_staff = 'true'
      } else if (roleFilter === 'client') {
        params.is_staff = 'false'
      }
      const res = await api.get('admin/users/', { params })
      setUsers(res.data.results || [])
      setTotalPages(res.data.total_pages || 1)
      setTotalCount(res.data.count || 0)
      setError('')
    } catch (err) {
      setError(err.response?.data?.error || 'Không tải được danh sách người dùng.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [searchTerm, roleFilter, currentPage])

  const handleOpenEdit = (user) => {
    setUserToEdit(user)
    setEditIsStaff(user.is_staff)
    setEditIsActive(user.status === 'active')
    setIsEditOpen(true)
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    setEditLoading(true)
    try {
      await api.put(`admin/users/${userToEdit.id}/`, {
        is_staff: editIsStaff,
        is_active: editIsActive
      })
      setIsEditOpen(false)
      fetchUsers()
    } catch (err) {
      setError('Không thể cập nhật người dùng.')
    } finally {
      setEditLoading(false)
    }
  }

  const handleConfirmDelete = (user) => {
    setUserToDelete(user)
    setDeleteConfirmOpen(true)
  }

  const handleDeleteSubmit = async () => {
    setLoading(true)
    try {
      const res = await api.delete(`admin/users/${userToDelete.id}/`)
      setDeleteConfirmOpen(false)
      setUserToDelete(null)
      fetchUsers()
    } catch (err) {
      setError(err.response?.data?.error || 'Không thể xóa người dùng này.')
      setLoading(false)
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

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Quản trị Người dùng</h1>
          <p className="text-sm text-slate-500 mt-1">Quản lý quyền truy cập nhân viên và tài khoản khách hàng.</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Tìm kiếm theo tên, email, tên đăng nhập..." 
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:bg-white transition-colors" 
            value={searchTerm} 
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1)
            }} 
          />
        </div>
        <div className="flex gap-4">
          <select 
            className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-700 outline-none focus:border-blue-500 transition-colors cursor-pointer"
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value)
              setCurrentPage(1)
            }}
          >
            <option value="">Tất cả vai trò</option>
            <option value="staff">Nhân viên / Admin</option>
            <option value="client">Khách hàng</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl flex items-center gap-3">
          <Info size={18} />
          <p className="font-semibold">{error}</p>
        </div>
      )}

      {/* Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-w-0">
        <div className="overflow-x-auto">
          {loading && users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="animate-spin text-blue-600 mb-2" size={32} />
              <p className="text-slate-500 text-sm font-semibold">Đang tải danh sách người dùng...</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-4 px-6">Tài khoản</th>
                  <th className="py-4 px-6">Email</th>
                  <th className="py-4 px-6">Vai trò</th>
                  <th className="py-4 px-6">Trạng thái</th>
                  <th className="py-4 px-6 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.length > 0 ? (
                  users.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-6">
                        <div className="flex items-center gap-3">
                          <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover border border-slate-200" />
                          <div>
                            <span className="font-bold text-slate-800 text-sm">{user.name}</span>
                            <p className="text-xs text-slate-400 font-semibold mt-0.5">ID: {user.username}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-6 text-sm text-slate-600 font-medium">{user.email}</td>
                      <td className="py-3 px-6">
                        <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold inline-flex items-center gap-1 ${user.is_staff ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                          {user.is_staff && <ShieldCheck size={12}/>}
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
                          <button 
                            onClick={() => handleOpenEdit(user)}
                            className="p-1.5 text-slate-400 hover:text-amber-600 rounded-lg hover:bg-amber-50 cursor-pointer"
                          >
                            <Edit size={16} />
                          </button>
                          <button 
                            onClick={() => handleConfirmDelete(user)}
                            className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 cursor-pointer"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-slate-400 font-bold">Không tìm thấy tài khoản nào.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Footer */}
        {totalCount > 0 && (
          <div className="px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-500">
              Hiển thị <span className="font-bold text-slate-800">{startRange}</span> đến <span className="font-bold text-slate-800">{endRange}</span> trong số <span className="font-bold text-slate-800">{totalCount}</span> người dùng
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

      {/* ─── Edit User Modal ─── */}
      {isEditOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 max-w-sm w-full shadow-2xl space-y-4">
            
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <h3 className="font-bold text-slate-800 text-lg">Cập nhật tài khoản</h3>
              <button onClick={() => setIsEditOpen(false)} className="p-1 hover:bg-slate-50 rounded-lg text-slate-400"><X size={18} /></button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="space-y-1 bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id="editIsStaff"
                    className="rounded border-slate-350 text-blue-600 focus:ring-blue-500"
                    checked={editIsStaff}
                    onChange={e => setEditIsStaff(e.target.checked)}
                  />
                  <label htmlFor="editIsStaff" className="text-xs font-bold text-slate-700 cursor-pointer select-none">Quyền quản trị / Nhân viên (Staff)</label>
                </div>

                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id="editIsActive"
                    className="rounded border-slate-350 text-blue-600 focus:ring-blue-500"
                    checked={editIsActive}
                    onChange={e => setEditIsActive(e.target.checked)}
                  />
                  <label htmlFor="editIsActive" className="text-xs font-bold text-slate-700 cursor-pointer select-none">Tài khoản kích hoạt (Active)</label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setIsEditOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 cursor-pointer"
                >
                  Hủy
                </button>
                <button 
                  type="submit" 
                  disabled={editLoading}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-750 text-white font-bold text-xs shadow-sm cursor-pointer"
                >
                  {editLoading && <Loader2 size={12} className="animate-spin" />}
                  <span>Lưu thay đổi</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Delete Confirmation Modal ─── */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 max-w-sm w-full shadow-2xl flex flex-col items-center text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-500 flex items-center justify-center">
              <Trash2 size={24} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-lg">Xóa tài khoản</h3>
              <p className="text-slate-500 text-sm mt-1">Bạn có chắc chắn muốn xóa vĩnh viễn tài khoản <b>{userToDelete?.email}</b>? Hành động này có thể xóa bỏ toàn bộ lịch sử mua sắm của họ.</p>
            </div>
            <div className="flex gap-3 w-full">
              <button 
                onClick={() => setDeleteConfirmOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-250 text-slate-600 font-bold text-xs hover:bg-slate-50 cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button 
                onClick={handleDeleteSubmit}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs cursor-pointer"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

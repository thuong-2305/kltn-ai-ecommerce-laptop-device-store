import { useState, useEffect } from 'react'
import { Search, Plus, Edit, Trash2, Tag, Loader2, Info, X, Upload } from 'lucide-react'
import api from '../../services/api'

export default function AdminCategoriesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Modal control states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentCategory, setCurrentCategory] = useState(null)
  const [modalLoading, setModalLoading] = useState(false)
  const [modalError, setModalError] = useState('')

  // Form states
  const [name, setName] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')

  // Delete control states
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState(null)

  const fetchCategories = async () => {
    setLoading(true)
    try {
      const res = await api.get('admin/categories/')
      setCategories(res.data.results || [])
      setError('')
    } catch (err) {
      setError(err.response?.data?.error || 'Không tải được danh sách danh mục.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const handleOpenModal = (cat = null) => {
    setCurrentCategory(cat)
    if (cat) {
      setName(cat.name)
      setImagePreview(cat.img)
      setImageFile(null)
    } else {
      setName('')
      setImagePreview('')
      setImageFile(null)
    }
    setModalError('')
    setIsModalOpen(true)
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault()
    if (!name) {
      setModalError('Vui lòng điền đầy đủ tên danh mục.')
      return
    }

    setModalLoading(true)
    setModalError('')

    const formData = new FormData()
    formData.append('name', name)
    if (imageFile) {
      formData.append('image', imageFile)
    }

    try {
      if (currentCategory) {
        // Edit mode
        await api.put(`admin/categories/${currentCategory.id}/`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
      } else {
        // Create mode
        await api.post('admin/categories/', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
      }
      setIsModalOpen(false)
      fetchCategories()
    } catch (err) {
      setModalError(err.response?.data?.error || 'Có lỗi xảy ra khi lưu danh mục.')
    } finally {
      setModalLoading(false)
    }
  }

  const handleConfirmDelete = (cat) => {
    setCategoryToDelete(cat)
    setDeleteConfirmOpen(true)
  }

  const handleDeleteSubmit = async () => {
    if (!categoryToDelete) return
    setLoading(true)
    try {
      await api.delete(`admin/categories/${categoryToDelete.id}/`)
      setDeleteConfirmOpen(false)
      setCategoryToDelete(null)
      fetchCategories()
    } catch (err) {
      setError(err.response?.data?.error || 'Không thể xóa danh mục.')
      setLoading(false)
    }
  }

  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading && categories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 min-h-[60vh]">
        <Loader2 className="animate-spin text-blue-600 mb-3" size={36} />
        <p className="text-slate-500 font-bold text-sm">Đang tải danh mục...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Danh mục sản phẩm</h1>
          <p className="text-sm text-slate-500 mt-1">Quản lý và phân loại các mặt hàng trên cửa hàng.</p>
        </div>
        <button 
          onClick={() => handleOpenModal(null)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-bold text-sm transition-colors shadow-sm shadow-blue-600/20 cursor-pointer"
        >
          <Plus size={18} /> Thêm danh mục
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Tìm kiếm danh mục..." 
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 transition-colors" 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
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
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-4 px-6">Danh mục</th>
                <th className="py-4 px-6">Đường dẫn (Slug)</th>
                <th className="py-4 px-6 text-center">Số sản phẩm</th>
                <th className="py-4 px-6">Trạng thái</th>
                <th className="py-4 px-6 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCategories.length > 0 ? (
                filteredCategories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-slate-100 overflow-hidden shrink-0">
                          {cat.img ? (
                            <img src={cat.img} alt={cat.name} className="w-full h-full object-cover" />
                          ) : (
                            <Tag size={18} />
                          )}
                        </div>
                        <span className="font-bold text-slate-800">{cat.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-6 text-sm text-slate-500">/{cat.slug}</td>
                    <td className="py-3 px-6 text-sm font-bold text-slate-700 text-center">{cat.count}</td>
                    <td className="py-3 px-6">
                      <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold bg-green-100 text-green-700`}>
                        Hiển thị
                      </span>
                    </td>
                    <td className="py-3 px-6 text-right">
                      <div className="flex justify-end gap-1">
                        <button 
                          onClick={() => handleOpenModal(cat)}
                          className="p-1.5 text-slate-400 hover:text-amber-600 rounded-lg hover:bg-amber-50 cursor-pointer"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => handleConfirmDelete(cat)}
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
                  <td colSpan="5" className="py-8 text-center text-slate-400 font-bold">Không tìm thấy danh mục nào.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Add/Edit Category Modal ─── */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden flex flex-col p-6 space-y-4">
            
            {/* Header */}
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h2 className="text-xl font-black text-slate-800">
                {currentCategory ? 'Cập nhật Danh mục' : 'Thêm Danh mục mới'}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleFormSubmit} className="space-y-4">
              {modalError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2 font-semibold">
                  <Info size={14} />
                  <span>{modalError}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">Tên danh mục *</label>
                <input 
                  type="text" 
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                />
              </div>

              {/* Image upload */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500">Hình ảnh danh mục</label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 px-4 py-2 border border-dashed border-slate-300 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors text-xs font-bold text-slate-600">
                    <Upload size={14} />
                    <span>Chọn hình ảnh</span>
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                  </label>
                  {imagePreview && (
                    <div className="w-16 h-16 rounded-xl border border-slate-200 overflow-hidden relative shrink-0">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 cursor-pointer"
                >
                  Hủy
                </button>
                <button 
                  type="submit"
                  disabled={modalLoading}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-750 text-white font-bold text-xs shadow-sm cursor-pointer"
                >
                  {modalLoading && <Loader2 size={12} className="animate-spin" />}
                  <span>Lưu thông tin</span>
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
              <h3 className="font-bold text-slate-800 text-lg">Xóa danh mục</h3>
              <p className="text-slate-500 text-sm mt-1">Bạn có chắc muốn xóa danh mục <b>{categoryToDelete?.name}</b>? Các sản phẩm thuộc danh mục này sẽ có thể bị ảnh hưởng.</p>
            </div>
            <div className="flex gap-3 w-full">
              <button 
                onClick={() => setDeleteConfirmOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-250 text-slate-600 font-bold text-xs hover:bg-slate-50 cursor-pointer"
              >
                Hủy
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

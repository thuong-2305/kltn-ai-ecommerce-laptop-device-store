import { useState, useEffect } from 'react'
import { Plus, Search, Edit, Trash2, Loader2, Info, X, Upload } from 'lucide-react'
import api from '../../services/api'

const STATUS_CONFIG = {
  active: { label: 'Đang bán', cls: 'bg-green-100 text-green-700' },
  out_of_stock: { label: 'Hết hàng', cls: 'bg-red-100 text-red-700' },
  hidden: { label: 'Đang ẩn', cls: 'bg-slate-100 text-slate-700' },
}

export default function AdminProductsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [brands, setBrands] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [limit] = useState(10)

  // Modal control states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentProduct, setCurrentProduct] = useState(null) // null for create mode
  const [modalLoading, setModalLoading] = useState(false)
  const [modalError, setModalError] = useState('')

  // Form states
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [categoryVal, setCategoryVal] = useState('')
  const [brandVal, setBrandVal] = useState('')
  const [stock, setStock] = useState('')
  const [isSale, setIsSale] = useState(false)
  const [salePrice, setSalePrice] = useState('')
  const [shortDesc, setShortDesc] = useState('')
  const [desc, setDesc] = useState('')
  const [config, setConfig] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')

  // Multiple Thumbnails states
  const [existingThumbnails, setExistingThumbnails] = useState([]) // list of {id, image}
  const [deleteThumbnailIds, setDeleteThumbnailIds] = useState([]) // list of ids to delete
  const [newThumbnailFiles, setNewThumbnailFiles] = useState([]) // list of files to upload
  const [newThumbnailPreviews, setNewThumbnailPreviews] = useState([]) // list of blob URLs

  // Delete control states
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState(null)

  const fetchInitialData = async () => {
    setLoading(true)
    try {
      const [prodRes, catRes, brandRes] = await Promise.all([
        api.get('admin/products/', {
          params: {
            search: searchTerm,
            category: selectedCategory,
            page: currentPage,
            limit: limit
          }
        }),
        api.get('categories/'),
        api.get('brands/')
      ])
      setProducts(prodRes.data.results || [])
      setTotalPages(prodRes.data.total_pages || 1)
      setTotalCount(prodRes.data.count || 0)
      setCategories(catRes.data.results || [])
      setBrands(brandRes.data.results || [])
      setError('')
    } catch (err) {
      setError(err.response?.data?.error || 'Không tải được danh sách sản phẩm.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInitialData()
  }, [searchTerm, selectedCategory, currentPage])

  const handleOpenModal = async (prod = null) => {
    setCurrentProduct(prod)
    setDeleteThumbnailIds([])
    setNewThumbnailFiles([])
    setNewThumbnailPreviews([])
    setExistingThumbnails([])

    if (prod) {
      // Edit mode - Fetch full details to get thumbnails list
      setModalLoading(true)
      setIsModalOpen(true)
      try {
        const detailsRes = await api.get(`admin/products/${prod.id}/`)
        const fullProd = detailsRes.data
        setName(fullProd.name)
        setPrice(fullProd.price)
        setCategoryVal(fullProd.category_id || '')
        setBrandVal(fullProd.brand_id || '')
        setStock(fullProd.stock)
        setIsSale(fullProd.is_sale)
        setSalePrice(fullProd.sale_price || '')
        setShortDesc(fullProd.short_description || '')
        setDesc(fullProd.description || '')
        setConfig(fullProd.config || '')
        setImagePreview(fullProd.img)
        setImageFile(null)
        setExistingThumbnails(fullProd.thumbnails || [])
      } catch (err) {
        setModalError('Không tải được thông tin sản phẩm.')
      } finally {
        setModalLoading(false)
      }
    } else {
      // Create mode
      setName('')
      setPrice('')
      setCategoryVal('')
      setBrandVal('')
      setStock('0')
      setIsSale(false)
      setSalePrice('')
      setShortDesc('')
      setDesc('')
      setConfig('')
      setImagePreview('')
      setImageFile(null)
      setIsModalOpen(true)
    }
    setModalError('')
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  // Multi thumbnails upload handler
  const handleThumbnailsChange = (e) => {
    const files = Array.from(e.target.files)
    if (files.length > 0) {
      setNewThumbnailFiles(prev => [...prev, ...files])
      const previews = files.map(file => URL.createObjectURL(file))
      setNewThumbnailPreviews(prev => [...prev, ...previews])
    }
  }

  const handleRemoveExistingThumbnail = (id) => {
    setDeleteThumbnailIds(prev => [...prev, id])
    setExistingThumbnails(prev => prev.filter(t => t.id !== id))
  }

  const handleRemoveNewThumbnail = (index) => {
    setNewThumbnailFiles(prev => prev.filter((_, idx) => idx !== index))
    setNewThumbnailPreviews(prev => prev.filter((_, idx) => idx !== index))
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault()
    if (!name || !price || !categoryVal) {
      setModalError('Vui lòng điền đầy đủ tên, giá và danh mục sản phẩm.')
      return
    }

    setModalLoading(true)
    setModalError('')

    const formData = new FormData()
    formData.append('name', name)
    formData.append('price', price)
    formData.append('category_id', categoryVal)
    formData.append('brand_id', brandVal)
    formData.append('stock', stock)
    formData.append('is_sale', isSale)
    formData.append('sale_price', salePrice || 0)
    formData.append('short_description', shortDesc)
    formData.append('description', desc)
    formData.append('config', config)
    
    if (imageFile) {
      formData.append('image', imageFile)
    }

    if (currentProduct) {
      // Edit mode - send deletes list and upload news
      if (deleteThumbnailIds.length > 0) {
        formData.append('delete_thumbnail_ids', deleteThumbnailIds.join(','))
      }
      newThumbnailFiles.forEach(file => {
        formData.append('new_thumbnails', file)
      })

      try {
        await api.put(`admin/products/${currentProduct.id}/`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        setIsModalOpen(false)
        fetchInitialData()
      } catch (err) {
        setModalError(err.response?.data?.error || 'Có lỗi xảy ra khi lưu thông tin.')
      } finally {
        setModalLoading(false)
      }
    } else {
      // Create mode - upload initial thumbnails list
      newThumbnailFiles.forEach(file => {
        formData.append('thumbnails', file)
      })

      try {
        await api.post('admin/products/', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        setIsModalOpen(false)
        fetchInitialData()
      } catch (err) {
        setModalError(err.response?.data?.error || 'Có lỗi xảy ra khi lưu thông tin.')
      } finally {
        setModalLoading(false)
      }
    }
  }

  const handleConfirmDelete = (prod) => {
    setProductToDelete(prod)
    setDeleteConfirmOpen(true)
  }

  const handleDeleteSubmit = async () => {
    if (!productToDelete) return
    setLoading(true)
    try {
      await api.delete(`admin/products/${productToDelete.id}/`)
      setDeleteConfirmOpen(false)
      setProductToDelete(null)
      fetchInitialData()
    } catch (err) {
      setError(err.response?.data?.error || 'Không thể xóa sản phẩm.')
      setLoading(false)
    }
  }

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  const startRange = totalCount > 0 ? (currentPage - 1) * limit + 1 : 0
  const endRange = Math.min(currentPage * limit, totalCount)
  const pageNumbers = []
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i)
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Quản lý Sản phẩm</h1>
          <p className="text-sm text-slate-500 mt-1">Quản lý danh sách sản phẩm, giá bán và tồn kho.</p>
        </div>
        <button 
          onClick={() => handleOpenModal(null)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-bold text-sm transition-colors shadow-sm shadow-blue-600/20 cursor-pointer"
        >
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
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1)
            }}
          />
        </div>
        <div className="flex gap-4">
          <select 
            className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-700 outline-none focus:border-blue-500 transition-colors cursor-pointer"
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value)
              setCurrentPage(1)
            }}
          >
            <option value="">Tất cả danh mục</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
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
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-4 px-6">Sản phẩm</th>
                <th className="py-4 px-6">Danh mục</th>
                <th className="py-4 px-6">Thương hiệu</th>
                <th className="py-4 px-6">Giá bán</th>
                <th className="py-4 px-6">Tồn kho</th>
                <th className="py-4 px-6">Trạng thái</th>
                <th className="py-4 px-6 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.length > 0 ? (
                products.map((prod) => {
                  const cfg = STATUS_CONFIG[prod.status] || STATUS_CONFIG.active
                  return (
                    <tr key={prod.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="py-3 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg border border-slate-200 bg-white overflow-hidden shrink-0">
                            <img src={prod.img || 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=50&h=50&fit=crop'} alt={prod.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="min-w-0 max-w-[260px]">
                            <p className="font-bold text-slate-800 text-sm truncate group-hover:text-blue-600 transition-colors cursor-pointer">{prod.name}</p>
                            <p className="text-xs text-slate-500 mt-0.5">Mã: SP{String(prod.id).padStart(3, '0')}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-6 text-sm text-slate-600 font-medium">{prod.category}</td>
                      <td className="py-3 px-6 text-sm text-slate-600 font-medium">{prod.brand}</td>
                      <td className="py-3 px-6 text-sm font-bold text-slate-800">
                        {prod.is_sale ? (
                          <div className="flex flex-col">
                            <span className="text-green-600 font-bold">{fPrice(prod.sale_price)}</span>
                            <del className="text-xs text-slate-400 font-semibold">{fPrice(prod.price)}</del>
                          </div>
                        ) : (
                          <span>{fPrice(prod.price)}</span>
                        )}
                      </td>
                      <td className="py-3 px-6 text-sm text-slate-600">
                        {prod.stock > 0 ? (
                          <span className="font-bold">{prod.stock}</span>
                        ) : (
                          <span className="text-red-500 font-black">Hết hàng</span>
                        )}
                      </td>
                      <td className="py-3 px-6">
                        <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${cfg.cls}`}>
                          {cfg.label}
                        </span>
                      </td>
                      <td className="py-3 px-6 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button 
                            onClick={() => handleOpenModal(prod)}
                            className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer" 
                            title="Sửa"
                          >
                            <Edit size={16} />
                          </button>
                          <button 
                            onClick={() => handleConfirmDelete(prod)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer" 
                            title="Xóa"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-400 font-bold">Không tìm thấy sản phẩm nào.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalCount > 0 && (
          <div className="px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-500">
              Hiển thị <span className="font-bold text-slate-800">{startRange}</span> đến <span className="font-bold text-slate-800">{endRange}</span> trong số <span className="font-bold text-slate-800">{totalCount}</span> sản phẩm
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

      {/* ─── Add/Edit Product Modal ─── */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto flex flex-col p-6 space-y-4">
            
            {/* Header */}
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h2 className="text-xl font-black text-slate-800">
                {currentProduct ? 'Cập nhật Sản phẩm' : 'Thêm Sản phẩm mới'}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleFormSubmit} className="space-y-4 flex-1">
              {modalError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2 font-semibold">
                  <Info size={14} />
                  <span>{modalError}</span>
                </div>
              )}

              {/* Rows */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">Tên sản phẩm *</label>
                  <input 
                    type="text" 
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500" 
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">Giá bán chính (VND) *</label>
                  <input 
                    type="number" 
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500" 
                    value={price} 
                    onChange={e => setPrice(e.target.value)} 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">Danh mục *</label>
                  <select 
                    required
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 cursor-pointer"
                    value={categoryVal}
                    onChange={e => setCategoryVal(e.target.value)}
                  >
                    <option value="">Chọn danh mục</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">Thương hiệu</label>
                  <select 
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 cursor-pointer"
                    value={brandVal}
                    onChange={e => setBrandVal(e.target.value)}
                  >
                    <option value="">Chọn thương hiệu</option>
                    {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">Số lượng tồn kho</label>
                  <input 
                    type="number" 
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500" 
                    value={stock} 
                    onChange={e => setStock(e.target.value)} 
                  />
                </div>
              </div>

              {/* Promo options */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id="isSale"
                    className="rounded border-slate-350 text-blue-600 focus:ring-blue-500"
                    checked={isSale}
                    onChange={e => setIsSale(e.target.checked)}
                  />
                  <label htmlFor="isSale" className="text-xs font-bold text-slate-700 cursor-pointer select-none">Đang giảm giá (Sale)</label>
                </div>
                <div className="md:col-span-2 space-y-1">
                  <label className="text-xs font-bold text-slate-500">Giá khuyến mại (VND)</label>
                  <input 
                    type="number" 
                    disabled={!isSale}
                    className="w-full px-3.5 py-1.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 disabled:opacity-50" 
                    value={salePrice} 
                    onChange={e => setSalePrice(e.target.value)} 
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">Mô tả ngắn</label>
                <textarea 
                  rows="2"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 resize-y" 
                  value={shortDesc} 
                  onChange={e => setShortDesc(e.target.value)} 
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">Mô tả chi tiết</label>
                <textarea 
                  rows="4"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 resize-y" 
                  value={desc} 
                  onChange={e => setDesc(e.target.value)} 
                />
              </div>

              {/* Specs string config */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">Cấu hình kỹ thuật</label>
                <textarea 
                  rows="2"
                  placeholder="- CPU + Intel Core i7 + RAM + 16GB"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500" 
                  value={config} 
                  onChange={e => setConfig(e.target.value)} 
                />
              </div>

              {/* Image upload */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500">Hình ảnh sản phẩm chính</label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 px-4 py-2 border border-dashed border-slate-300 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors text-xs font-bold text-slate-600">
                    <Upload size={14} />
                    <span>Chọn tệp ảnh</span>
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                  </label>
                  {imagePreview && (
                    <div className="w-16 h-16 rounded-xl border border-slate-200 overflow-hidden relative shrink-0">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>

              {/* Multiple Thumbnails Section */}
              <div className="space-y-3 bg-slate-50/50 border border-slate-200 rounded-2xl p-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <label className="text-xs font-black text-slate-700">Hình ảnh Thumbnail bổ sung</label>
                  <label className="flex items-center gap-1.5 px-3 py-1 border border-dashed border-blue-500 rounded-lg cursor-pointer hover:bg-blue-50/50 transition-colors text-[11px] font-bold text-blue-600">
                    <Upload size={12} />
                    <span>Thêm ảnh phụ</span>
                    <input type="file" className="hidden" accept="image/*" multiple onChange={handleThumbnailsChange} />
                  </label>
                </div>

                {/* Grid of thumbnails */}
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                  {/* Existing thumbnails */}
                  {existingThumbnails.map((t) => (
                    <div key={t.id} className="relative aspect-square rounded-xl border border-slate-200 overflow-hidden group">
                      <img src={t.image} className="w-full h-full object-cover" />
                      <button 
                        type="button"
                        onClick={() => handleRemoveExistingThumbnail(t.id)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 cursor-pointer shadow-md opacity-90 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ))}

                  {/* Newly selected thumbnails */}
                  {newThumbnailPreviews.map((previewUrl, index) => (
                    <div key={index} className="relative aspect-square rounded-xl border border-blue-200 overflow-hidden group">
                      <img src={previewUrl} className="w-full h-full object-cover" />
                      <button 
                        type="button"
                        onClick={() => handleRemoveNewThumbnail(index)}
                        className="absolute top-1 right-1 bg-slate-800 text-white rounded-full p-0.5 hover:bg-slate-900 cursor-pointer shadow-md opacity-90 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ))}

                  {existingThumbnails.length === 0 && newThumbnailPreviews.length === 0 && (
                    <div className="col-span-full py-4 text-center text-slate-400 text-xs font-medium">Chưa có ảnh phụ nào được chọn.</div>
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
                  Hủy bỏ
                </button>
                <button 
                  type="submit"
                  disabled={modalLoading}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-750 text-white font-bold text-xs shadow-sm shadow-blue-600/10 cursor-pointer"
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
              <h3 className="font-bold text-slate-800 text-lg">Xác nhận xóa sản phẩm</h3>
              <p className="text-slate-500 text-sm mt-1">Bạn có chắc chắn muốn xóa sản phẩm <b>{productToDelete?.name}</b>? Hành động này không thể hoàn tác.</p>
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
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

function fPrice(price) {
  if (!price) return '0 đ'
  return fInt(price) + ' đ'
}
function fInt(val) {
  return Number(val).toLocaleString('vi-VN')
}

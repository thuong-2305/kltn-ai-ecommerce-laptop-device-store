import { useState } from 'react'
import { MapPin, Plus, X, Info } from 'lucide-react'

const DEFAULT_ADDRESSES = [
  {
    id: 1,
    name: 'Nguyễn Văn A',
    phone: '0901234567',
    street: '123 Đường ABC',
    ward: 'Phường 1',
    district: 'Quận 1',
    city: 'TP. Hồ Chí Minh',
    type: 'home', // home, work, relative, other
    isDefault: true
  },
  {
    id: 2,
    name: 'Nguyễn Văn A',
    phone: '0901234567',
    street: '456 Đường DEF',
    ward: 'Phường 3',
    district: 'Quận 3',
    city: 'TP. Hồ Chí Minh',
    type: 'work',
    isDefault: false
  },
  {
    id: 3,
    name: 'Nguyễn Văn A',
    phone: '0901234567',
    street: '789 Đường GHI',
    ward: 'Phường 7',
    district: 'Quận 7',
    city: 'TP. Hồ Chí Minh',
    type: 'relative',
    isDefault: false
  },
  {
    id: 4,
    name: 'Nguyễn Văn A',
    phone: '0901234567',
    street: '12/34 Đường JKL',
    ward: 'Phường 12',
    district: 'Quận 10',
    city: 'TP. Hồ Chí Minh',
    type: 'other',
    isDefault: false
  }
]

const TYPE_LABELS = {
  home: 'Nhà riêng',
  work: 'Công ty',
  relative: 'Nhà người thân',
  other: 'Khác'
}

export function AddressTab({ profile }) {
  const username = profile?.username || 'guest'
  const storageKey = `ld_addresses_${username}`

  const [addresses, setAddresses] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey)
      return saved ? JSON.parse(saved) : DEFAULT_ADDRESSES
    } catch {
      return DEFAULT_ADDRESSES
    }
  })

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingAddress, setEditingAddress] = useState(null)
  
  const [form, setForm] = useState({
    name: '',
    phone: '',
    street: '',
    ward: '',
    district: '',
    city: '',
    type: 'home',
    isDefault: false
  })
  
  const [errors, setErrors] = useState({})

  const saveToStorage = (newAddresses) => {
    setAddresses(newAddresses)
    localStorage.setItem(storageKey, JSON.stringify(newAddresses))
  }

  const handleSetDefault = (id) => {
    const updated = addresses.map(addr => ({
      ...addr,
      isDefault: addr.id === id
    }))
    saveToStorage(updated)
  }

  const handleOpenAdd = () => {
    setEditingAddress(null)
    setForm({
      name: profile?.full_name || '',
      phone: profile?.phone || '',
      street: '',
      ward: '',
      district: '',
      city: '',
      type: 'home',
      isDefault: addresses.length === 0
    })
    setErrors({})
    setIsModalOpen(true)
  }

  const handleOpenEdit = (addr) => {
    setEditingAddress(addr)
    setForm({
      name: addr.name,
      phone: addr.phone,
      street: addr.street,
      ward: addr.ward,
      district: addr.district,
      city: addr.city,
      type: addr.type,
      isDefault: addr.isDefault
    })
    setErrors({})
    setIsModalOpen(true)
  }

  const handleDelete = (id, e) => {
    e.stopPropagation()
    const target = addresses.find(a => a.id === id)
    if (target?.isDefault) {
      alert('Không thể xóa địa chỉ mặc định. Vui lòng thiết lập địa chỉ khác làm mặc định trước.')
      return
    }
    if (window.confirm('Bạn có chắc chắn muốn xóa địa chỉ này?')) {
      const filtered = addresses.filter(addr => addr.id !== id)
      saveToStorage(filtered)
    }
  }

  const validate = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Họ tên không được để trống'
    if (!form.phone.trim()) errs.phone = 'Số điện thoại không được để trống'
    else if (!/^[0-9+\s\-()]{9,15}$/.test(form.phone)) errs.phone = 'Số điện thoại không hợp lệ'
    if (!form.street.trim()) errs.street = 'Địa chỉ chi tiết không được để trống'
    if (!form.ward.trim()) errs.ward = 'Phường/Xã không được để trống'
    if (!form.district.trim()) errs.district = 'Quận/Huyện không được để trống'
    if (!form.city.trim()) errs.city = 'Tỉnh/Thành phố không được để trống'
    return errs
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }

    let updatedList = []
    if (editingAddress) {
      // Edit mode
      updatedList = addresses.map(addr => {
        if (addr.id === editingAddress.id) {
          return {
            ...addr,
            name: form.name.trim(),
            phone: form.phone.trim(),
            street: form.street.trim(),
            ward: form.ward.trim(),
            district: form.district.trim(),
            city: form.city.trim(),
            type: form.type,
            isDefault: form.isDefault
          }
        }
        return addr
      })
    } else {
      // Add mode
      const newAddress = {
        id: Date.now(),
        name: form.name.trim(),
        phone: form.phone.trim(),
        street: form.street.trim(),
        ward: form.ward.trim(),
        district: form.district.trim(),
        city: form.city.trim(),
        type: form.type,
        isDefault: form.isDefault
      }
      updatedList = [...addresses, newAddress]
    }

    // If this address is set to default, unset all others
    if (form.isDefault) {
      const defaultId = editingAddress ? editingAddress.id : updatedList[updatedList.length - 1].id
      updatedList = updatedList.map(addr => ({
        ...addr,
        isDefault: addr.id === defaultId
      }))
    }

    saveToStorage(updatedList)
    setIsModalOpen(false)
  }

  return (
    <div className="space-y-6">
      {/* Tab Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-black text-slate-900 tracking-tight">Sổ địa chỉ</h3>
          <p className="text-xs text-slate-500 mt-0.5">Quản lý và chọn địa chỉ giao hàng của bạn</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-4 h-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-[0_4px_12px_rgba(37,99,235,0.2)] hover:shadow-[0_6px_16px_rgba(37,99,235,0.3)] hover:-translate-y-0.5"
        >
          <Plus size={15} /> Thêm địa chỉ mới
        </button>
      </div>

      {/* Addresses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {addresses.map((addr) => (
          <div
            key={addr.id}
            onClick={() => handleSetDefault(addr.id)}
            className={`relative bg-white rounded-2xl border p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-all cursor-pointer min-h-[220px] ${
              addr.isDefault ? 'border-blue-500 ring-2 ring-blue-500/10' : 'border-slate-200'
            }`}
          >
            {/* Top Info */}
            <div className="flex gap-3 items-start">
              {/* Custom Radio Button */}
              <div className="pt-0.5 shrink-0">
                {addr.isDefault ? (
                  <div className="w-[18px] h-[18px] rounded-full border-2 border-blue-600 flex items-center justify-center">
                    <div className="w-[9px] h-[9px] bg-blue-600 rounded-full" />
                  </div>
                ) : (
                  <div className="w-[18px] h-[18px] rounded-full border-2 border-slate-300 hover:border-slate-400 transition-colors" />
                )}
              </div>

              {/* Text content */}
              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-black text-slate-800 text-sm truncate">{addr.name}</span>
                  {addr.isDefault && (
                    <span className="bg-blue-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider scale-95 shrink-0">
                      Mặc định
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-500 font-semibold">{addr.phone}</p>
                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  {addr.street}, {addr.ward}, {addr.district}, {addr.city}
                </p>

                <div className="pt-1">
                  <span className="inline-block bg-slate-100 border border-slate-200/50 text-slate-500 text-[10px] font-bold px-2 py-0.5 rounded-md">
                    {TYPE_LABELS[addr.type] || 'Khác'}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="flex gap-3 mt-5 pt-3.5 border-t border-slate-100">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleOpenEdit(addr)
                }}
                className="flex-1 py-1.5 text-center text-xs font-bold text-blue-600 border border-blue-100 bg-blue-50/10 hover:bg-blue-50/50 rounded-xl transition-all"
              >
                Chỉnh sửa
              </button>
              <button
                onClick={(e) => handleDelete(addr.id, e)}
                className={`flex-1 py-1.5 text-center text-xs font-bold rounded-xl transition-all border ${
                  addr.isDefault
                    ? 'text-slate-300 border-slate-100 bg-slate-50/50 cursor-not-allowed'
                    : 'text-red-600 border-red-100 bg-red-50/10 hover:bg-red-50/50'
                }`}
                disabled={addr.isDefault}
              >
                Xóa
              </button>
            </div>
          </div>
        ))}

        {/* Dashed Add Card */}
        <div
          onClick={handleOpenAdd}
          className="flex flex-col items-center justify-center text-center border-2 border-dashed border-slate-200 hover:border-blue-500 hover:bg-blue-50/5 rounded-2xl p-5 min-h-[220px] cursor-pointer group transition-all"
        >
          <div className="w-11 h-11 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 group-hover:border-blue-200 transition-all shadow-sm mb-3">
            <Plus size={18} />
          </div>
          <span className="text-sm font-black text-slate-700 group-hover:text-blue-600 transition-colors">
            Thêm địa chỉ mới
          </span>
          <span className="text-[11px] text-slate-400 mt-0.5">Thêm địa chỉ giao hàng khác</span>
        </div>
      </div>

      {/* Guide Banner */}
      <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-5 relative overflow-hidden">
        <div className="space-y-3 relative z-10">
          <div className="flex items-center gap-2 text-blue-800 font-bold text-xs uppercase tracking-wider">
            <Info size={15} /> Hướng dẫn
          </div>
          <ul className="space-y-1.5 text-xs text-slate-600 font-medium">
            <li className="flex items-start gap-2">
              <span className="text-blue-500 font-bold">•</span>
              Bạn có thể thêm tối đa 10 địa chỉ giao hàng.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 font-bold">•</span>
              Chỉ có thể chọn 1 địa chỉ mặc định tại một thời điểm.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 font-bold">•</span>
              Địa chỉ mặc định sẽ được tự động chọn khi thanh toán.
            </li>
          </ul>
        </div>
        <div className="shrink-0 relative z-10 w-28 h-20 bg-white rounded-xl border border-slate-100 shadow-sm flex items-center justify-center">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.06),transparent_70%)]" />
          <MapPin size={32} className="text-blue-600 animate-bounce duration-1000" />
        </div>
      </div>

      {/* Add / Edit Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl transform transition-all duration-300 scale-100 flex flex-col max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h4 className="font-black text-slate-900 uppercase tracking-tight text-sm">
                {editingAddress ? 'Chỉnh sửa địa chỉ' : 'Thêm địa chỉ mới'}
              </h4>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors"
              >
                <X size={15} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-6 space-y-4 overflow-y-auto flex-1">
                {/* Họ tên & Sđt */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Họ tên *</label>
                    <input
                      type="text"
                      className={`h-11 px-4 border rounded-xl text-sm outline-none bg-slate-50/30 ${
                        errors.name ? 'border-red-400 focus:ring-2 focus:ring-red-100' : 'border-slate-200 focus:border-blue-500'
                      }`}
                      placeholder="Nguyễn Văn A"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                    {errors.name && <p className="text-[11px] text-red-600 font-semibold">{errors.name}</p>}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Số điện thoại *</label>
                    <input
                      type="text"
                      className={`h-11 px-4 border rounded-xl text-sm outline-none bg-slate-50/30 ${
                        errors.phone ? 'border-red-400 focus:ring-2 focus:ring-red-100' : 'border-slate-200 focus:border-blue-500'
                      }`}
                      placeholder="0901234567"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    />
                    {errors.phone && <p className="text-[11px] text-red-600 font-semibold">{errors.phone}</p>}
                  </div>
                </div>

                {/* Tỉnh thành, Quận huyện, Phường xã */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Tỉnh / Thành phố *</label>
                    <input
                      type="text"
                      className={`h-11 px-4 border rounded-xl text-sm outline-none bg-slate-50/30 ${
                        errors.city ? 'border-red-400 focus:ring-2 focus:ring-red-100' : 'border-slate-200 focus:border-blue-500'
                      }`}
                      placeholder="TP. Hồ Chí Minh"
                      value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                    />
                    {errors.city && <p className="text-[11px] text-red-600 font-semibold">{errors.city}</p>}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Quận / Huyện *</label>
                    <input
                      type="text"
                      className={`h-11 px-4 border rounded-xl text-sm outline-none bg-slate-50/30 ${
                        errors.district ? 'border-red-400 focus:ring-2 focus:ring-red-100' : 'border-slate-200 focus:border-blue-500'
                      }`}
                      placeholder="Quận 1"
                      value={form.district}
                      onChange={(e) => setForm({ ...form, district: e.target.value })}
                    />
                    {errors.district && <p className="text-[11px] text-red-600 font-semibold">{errors.district}</p>}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Phường / Xã *</label>
                    <input
                      type="text"
                      className={`h-11 px-4 border rounded-xl text-sm outline-none bg-slate-50/30 ${
                        errors.ward ? 'border-red-400 focus:ring-2 focus:ring-red-100' : 'border-slate-200 focus:border-blue-500'
                      }`}
                      placeholder="Phường Bến Nghé"
                      value={form.ward}
                      onChange={(e) => setForm({ ...form, ward: e.target.value })}
                    />
                    {errors.ward && <p className="text-[11px] text-red-600 font-semibold">{errors.ward}</p>}
                  </div>
                </div>

                {/* Địa chỉ chi tiết */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Địa chỉ chi tiết *</label>
                  <input
                    type="text"
                    className={`h-11 px-4 border rounded-xl text-sm outline-none bg-slate-50/30 ${
                      errors.street ? 'border-red-400 focus:ring-2 focus:ring-red-100' : 'border-slate-200 focus:border-blue-500'
                    }`}
                    placeholder="123 Đường ABC"
                    value={form.street}
                    onChange={(e) => setForm({ ...form, street: e.target.value })}
                  />
                  {errors.street && <p className="text-[11px] text-red-600 font-semibold">{errors.street}</p>}
                </div>

                {/* Loại địa chỉ */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Loại địa chỉ</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {Object.entries(TYPE_LABELS).map(([key, label]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setForm({ ...form, type: key })}
                        className={`h-10 rounded-xl text-xs font-bold border transition-all ${
                          form.type === key
                            ? 'bg-blue-50 border-blue-600 text-blue-700'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Default address checkbox */}
                <div className="flex items-center gap-2.5 pt-2">
                  <input
                    type="checkbox"
                    id="isDefault"
                    className="w-4.5 h-4.5 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
                    checked={form.isDefault}
                    onChange={(e) => {
                      if (editingAddress?.isDefault && !e.target.checked) return
                      setForm({ ...form, isDefault: e.target.checked })
                    }}
                    disabled={editingAddress?.isDefault}
                  />
                  <label htmlFor="isDefault" className="text-xs font-bold text-slate-700 cursor-pointer select-none">
                    Đặt làm địa chỉ mặc định
                  </label>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 h-10 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-6 h-10 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white text-xs font-bold transition-all shadow-md hover:shadow-lg"
                >
                  {editingAddress ? 'Cập nhật' : 'Lưu địa chỉ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

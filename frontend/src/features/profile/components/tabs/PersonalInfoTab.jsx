import { useState } from 'react'
import { User, Mail, Phone, MapPin, Loader2, Save } from 'lucide-react'
import { SectionTitle, Toast, Field, inputCls } from './shared'

export function PersonalInfoTab({ profile, onUpdate }) {
  const [form, setForm] = useState({
    first_name: profile?.user?.first_name || '',
    last_name: profile?.user?.last_name || '',
    email: profile?.user?.email || '',
    phone: profile?.phone || '',
    address: profile?.address || '',
  })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)

  // Sync when profile changes
  useState(() => {
    if (profile) setForm({
      first_name: profile.user?.first_name || '',
      last_name: profile.user?.last_name || '',
      email: profile.user?.email || '',
      phone: profile.phone || '',
      address: profile.address || '',
    })
  })

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const validate = () => {
    const e = {}
    if (!form.first_name.trim()) e.first_name = 'Vui lòng nhập họ'
    if (!form.email.trim()) e.email = 'Vui lòng nhập email'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Email không hợp lệ'
    if (form.phone && !/^[0-9+\s\-()]{7,15}$/.test(form.phone)) e.phone = 'Số điện thoại không hợp lệ'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    setSaving(true)
    setToast(null)
    try {
      await onUpdate(form)
      setToast({ msg: 'Cập nhật thông tin thành công!', type: 'success' })
    } catch (err) {
      setToast({ msg: err.response?.data?.error || 'Cập nhật thất bại, thử lại sau', type: 'error' })
    } finally {
      setSaving(false)
      setTimeout(() => setToast(null), 4000)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <SectionTitle icon={User} title="Thông tin cá nhân" subtitle="Cập nhật họ tên, email và liên hệ" />
      <Toast msg={toast?.msg} type={toast?.type} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Họ *" icon={User} error={errors.first_name}>
          <input type="text" placeholder="Nguyễn" className={inputCls()} value={form.first_name} onChange={set('first_name')} />
        </Field>
        <Field label="Tên" error={errors.last_name}>
          <input type="text" placeholder="Văn A" className={inputCls(false)} value={form.last_name} onChange={set('last_name')} />
        </Field>
      </div>

      <Field label="Email *" icon={Mail} error={errors.email}>
        <input type="email" placeholder="email@example.com" className={inputCls()} value={form.email} onChange={set('email')} />
      </Field>

      <Field label="Số điện thoại" icon={Phone} error={errors.phone}>
        <input type="tel" placeholder="0901 234 567" className={inputCls()} value={form.phone} onChange={set('phone')} />
      </Field>

      <Field label="Địa chỉ" icon={MapPin} error={errors.address}>
        <input type="text" placeholder="123 Đường ABC, Quận 1, TP.HCM" className={inputCls()} value={form.address} onChange={set('address')} />
      </Field>

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={saving}
          className="h-11 px-7 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold text-sm shadow-[0_6px_18px_rgba(37,99,235,0.28)] hover:shadow-[0_10px_24px_rgba(37,99,235,0.38)] hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {saving ? <><Loader2 size={15} className="animate-spin" />Đang lưu...</> : <><Save size={15} />Lưu thay đổi</>}
        </button>
      </div>
    </form>
  )
}

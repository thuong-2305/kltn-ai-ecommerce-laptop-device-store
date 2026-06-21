import { useState } from 'react'
import { Lock, Eye, EyeOff, Loader2, ShieldCheck, Lightbulb } from 'lucide-react'
import { SectionTitle, Toast, Field, inputCls } from './shared'

export function SecurityTab({ onChangePassword }) {
  const [form, setForm] = useState({ current_password: '', new_password: '', confirm_password: '' })
  const [show, setShow] = useState({ current: false, new: false, confirm: false })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))
  const toggleShow = (k) => () => setShow(s => ({ ...s, [k]: !s[k] }))

  const strength = (() => {
    const p = form.new_password
    return Math.min(
      (p.length >= 8 ? 1 : 0) +
      (/[A-Z]/.test(p) ? 1 : 0) +
      (/[0-9]/.test(p) ? 1 : 0) +
      (/[^A-Za-z0-9]/.test(p) ? 1 : 0), 4
    )
  })()

  const strengthLabel = ['', 'Yếu', 'Trung bình', 'Tốt', 'Mạnh'][strength]
  const strengthColor = ['', 'text-red-500', 'text-yellow-500', 'text-blue-500', 'text-green-500'][strength]

  const validate = () => {
    const e = {}
    if (!form.current_password) e.current_password = 'Nhập mật khẩu hiện tại'
    if (!form.new_password) e.new_password = 'Nhập mật khẩu mới'
    else if (form.new_password.length < 8) e.new_password = 'Ít nhất 8 ký tự'
    if (form.new_password !== form.confirm_password) e.confirm_password = 'Mật khẩu không khớp'
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
      await onChangePassword(form)
      setForm({ current_password: '', new_password: '', confirm_password: '' })
      setToast({ msg: 'Đổi mật khẩu thành công!', type: 'success' })
    } catch (err) {
      setToast({ msg: err.response?.data?.error || 'Đổi mật khẩu thất bại', type: 'error' })
    } finally {
      setSaving(false)
      setTimeout(() => setToast(null), 5000)
    }
  }

  const PwField = ({ label, fieldKey, placeholder }) => (
    <Field label={label} icon={Lock} error={errors[fieldKey]}>
      <input
        type={show[fieldKey] ? 'text' : 'password'}
        placeholder={placeholder}
        className={`${inputCls()} pr-11`}
        value={form[fieldKey]}
        onChange={set(fieldKey)}
        autoComplete={fieldKey === 'current_password' ? 'current-password' : 'new-password'}
      />
      <button
        type="button"
        onClick={toggleShow(fieldKey)}
        className="absolute right-3.5 text-slate-400 hover:text-slate-600 transition-colors"
      >
        {show[fieldKey] ? <EyeOff size={15} /> : <Eye size={15} />}
      </button>
    </Field>
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <SectionTitle icon={ShieldCheck} title="Bảo mật tài khoản" subtitle="Đổi mật khẩu để bảo vệ tài khoản của bạn" />
      <Toast msg={toast?.msg} type={toast?.type} />

      <PwField label="Mật khẩu hiện tại *" fieldKey="current_password" placeholder="Nhập mật khẩu hiện tại" />
      <PwField label="Mật khẩu mới *" fieldKey="new_password" placeholder="Ít nhất 8 ký tự" />

      {form.new_password && (
        <div className="space-y-1.5 -mt-2">
          <div className="flex gap-1">
            {[1,2,3,4].map(i => (
              <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                i <= strength
                  ? strength === 1 ? 'bg-red-400' : strength === 2 ? 'bg-yellow-400' : strength === 3 ? 'bg-blue-400' : 'bg-green-500'
                  : 'bg-slate-200'
              }`} />
            ))}
          </div>
          <p className={`text-xs font-semibold ${strengthColor}`}>Độ mạnh: {strengthLabel}</p>
        </div>
      )}

      <PwField label="Xác nhận mật khẩu mới *" fieldKey="confirm_password" placeholder="Nhập lại mật khẩu mới" />

      <div className="rounded-xl bg-blue-50 border border-blue-200/80 p-4 text-xs text-blue-700 space-y-1">
        <p className="font-bold mb-2 flex items-center gap-1.5">
          <Lightbulb size={14} className="text-amber-500 fill-amber-300 shrink-0" />
          Gợi ý mật khẩu mạnh:
        </p>
        <p>• Ít nhất 8 ký tự</p>
        <p>• Kết hợp chữ hoa, chữ thường, số</p>
        <p>• Thêm ký tự đặc biệt (!@#$%...)</p>
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={saving}
          className="h-11 px-7 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold text-sm shadow-[0_6px_18px_rgba(37,99,235,0.28)] hover:shadow-[0_10px_24px_rgba(37,99,235,0.38)] hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {saving ? <><Loader2 size={15} className="animate-spin" />Đang lưu...</> : <><ShieldCheck size={15} />Đổi mật khẩu</>}
        </button>
      </div>
    </form>
  )
}

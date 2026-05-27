import { useState, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock, User, ChevronRight, AlertCircle, Loader2 } from 'lucide-react'
import { useAuth } from '../../../contexts/AuthContext'

/* ─── Google Icon SVG ─────────────────────────────────────────── */
function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  )
}

/* ─── Field wrapper ───────────────────────────────────────────── */
function Field({ label, icon: Icon, error, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">{label}</label>
      <div className={`relative flex items-center rounded-xl border bg-white transition-all ${
        error ? 'border-red-400 shadow-[0_0_0_3px_rgba(239,68,68,0.12)]' : 'border-slate-200 focus-within:border-blue-500 focus-within:shadow-[0_0_0_3px_rgba(37,99,235,0.1)]'
      }`}>
        {Icon && (
          <span className="absolute left-3.5 text-slate-400 pointer-events-none">
            <Icon size={16} />
          </span>
        )}
        {children}
      </div>
      {error && (
        <p className="flex items-center gap-1.5 text-xs text-red-600 font-medium">
          <AlertCircle size={12} /> {error}
        </p>
      )}
    </div>
  )
}

const inputCls = (hasIcon) =>
  `w-full h-11 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 outline-none ${hasIcon ? 'pl-10 pr-4' : 'px-4'}`

/* ─── LoginForm ───────────────────────────────────────────────── */
export function LoginForm({ onSwitchToRegister, onSuccess }) {
  const { login, loginWithGoogle } = useAuth()
  const [form, setForm] = useState({ username: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [globalError, setGlobalError] = useState('')

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const validate = () => {
    const e = {}
    if (!form.username.trim()) e.username = 'Vui lòng nhập tên đăng nhập hoặc email'
    if (!form.password) e.password = 'Vui lòng nhập mật khẩu'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const e_ = validate()
    if (Object.keys(e_).length) { setErrors(e_); return }
    setErrors({})
    setGlobalError('')
    setSubmitting(true)
    try {
      await login(form)
      onSuccess?.()
    } catch (err) {
      setGlobalError(err.response?.data?.error || 'Đăng nhập thất bại, vui lòng thử lại')
    } finally {
      setSubmitting(false)
    }
  }

  const handleGoogle = () => {
    // Google GSI will be initialized when VITE_GOOGLE_CLIENT_ID is set
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
    if (!clientId) {
      setGlobalError('Google OAuth chưa được cấu hình. Vui lòng liên hệ quản trị viên.')
      return
    }
    // GSI prompt flow
    if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
      {/* Global error */}
      {globalError && (
        <div className="flex items-center gap-2.5 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 font-medium">
          <AlertCircle size={16} className="shrink-0" />
          {globalError}
        </div>
      )}

      <Field label="Email hoặc tên đăng nhập" icon={Mail} error={errors.username}>
        <input
          type="text"
          placeholder="email@example.com hoặc username"
          className={inputCls(true)}
          value={form.username}
          onChange={set('username')}
          autoComplete="username"
        />
      </Field>

      <Field label="Mật khẩu" icon={Lock} error={errors.password}>
        <input
          type={showPw ? 'text' : 'password'}
          placeholder="Nhập mật khẩu"
          className={`${inputCls(true)} pr-11`}
          value={form.password}
          onChange={set('password')}
          autoComplete="current-password"
        />
        <button
          type="button"
          onClick={() => setShowPw(v => !v)}
          className="absolute right-3.5 text-slate-400 hover:text-slate-600 transition-colors"
          aria-label={showPw ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
        >
          {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </Field>

      <div className="flex items-center justify-between -mt-1">
        <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer select-none">
          <input type="checkbox" className="w-4 h-4 accent-blue-600 rounded" />
          Ghi nhớ đăng nhập
        </label>
        <Link to="/forgot-password" className="text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline">
          Quên mật khẩu?
        </Link>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="h-12 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold text-sm shadow-[0_8px_20px_rgba(37,99,235,0.3)] hover:shadow-[0_12px_28px_rgba(37,99,235,0.4)] hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {submitting ? <><Loader2 size={16} className="animate-spin" /> Đang đăng nhập...</> : 'Đăng nhập'}
      </button>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <span className="flex-1 h-px bg-slate-200" />
        <span className="text-xs text-slate-400 font-medium">hoặc tiếp tục với</span>
        <span className="flex-1 h-px bg-slate-200" />
      </div>

      {/* Google OAuth */}
      <button
        type="button"
        onClick={handleGoogle}
        className="h-12 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold text-sm hover:bg-slate-50 hover:border-slate-300 active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-sm"
      >
        <GoogleIcon />
        Đăng nhập với Google
      </button>

      <p className="text-center text-sm text-slate-500">
        Chưa có tài khoản?{' '}
        <button type="button" onClick={onSwitchToRegister} className="font-bold text-blue-600 hover:text-blue-700 hover:underline">
          Đăng ký ngay
        </button>
      </p>
    </form>
  )
}

/* ─── RegisterForm ────────────────────────────────────────────── */
export function RegisterForm({ onSwitchToLogin, onSuccess }) {
  const { register } = useAuth()
  const [form, setForm] = useState({
    first_name: '', last_name: '', username: '', email: '', password: '', confirm: '',
  })
  const [showPw, setShowPw] = useState(false)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [globalError, setGlobalError] = useState('')

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const validate = () => {
    const e = {}
    if (!form.first_name.trim()) e.first_name = 'Vui lòng nhập họ'
    if (!form.username.trim()) e.username = 'Vui lòng nhập tên đăng nhập'
    else if (form.username.length < 3) e.username = 'Tên đăng nhập phải có ít nhất 3 ký tự'
    else if (!/^[a-zA-Z0-9_]+$/.test(form.username)) e.username = 'Chỉ được dùng chữ, số và dấu _'
    if (!form.email.trim()) e.email = 'Vui lòng nhập email'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Email không hợp lệ'
    if (!form.password) e.password = 'Vui lòng nhập mật khẩu'
    else if (form.password.length < 8) e.password = 'Mật khẩu phải có ít nhất 8 ký tự'
    if (form.password !== form.confirm) e.confirm = 'Mật khẩu xác nhận không khớp'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const e_ = validate()
    if (Object.keys(e_).length) { setErrors(e_); return }
    setErrors({})
    setGlobalError('')
    setSubmitting(true)
    try {
      await register({
        username: form.username,
        email: form.email,
        password: form.password,
        first_name: form.first_name,
        last_name: form.last_name,
      })
      onSuccess?.()
    } catch (err) {
      setGlobalError(err.response?.data?.error || 'Đăng ký thất bại, vui lòng thử lại')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      {globalError && (
        <div className="flex items-center gap-2.5 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 font-medium">
          <AlertCircle size={16} className="shrink-0" />
          {globalError}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Field label="Họ" icon={User} error={errors.first_name}>
          <input type="text" placeholder="Nguyễn" className={inputCls(true)} value={form.first_name} onChange={set('first_name')} />
        </Field>
        <Field label="Tên" error={errors.last_name}>
          <input type="text" placeholder="Văn A" className={inputCls(false)} value={form.last_name} onChange={set('last_name')} />
        </Field>
      </div>

      <Field label="Tên đăng nhập" icon={User} error={errors.username}>
        <input type="text" placeholder="username" className={inputCls(true)} value={form.username} onChange={set('username')} autoComplete="username" />
      </Field>

      <Field label="Email" icon={Mail} error={errors.email}>
        <input type="email" placeholder="email@example.com" className={inputCls(true)} value={form.email} onChange={set('email')} autoComplete="email" />
      </Field>

      <Field label="Mật khẩu" icon={Lock} error={errors.password}>
        <input
          type={showPw ? 'text' : 'password'}
          placeholder="Ít nhất 8 ký tự"
          className={`${inputCls(true)} pr-11`}
          value={form.password}
          onChange={set('password')}
          autoComplete="new-password"
        />
        <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-3.5 text-slate-400 hover:text-slate-600 transition-colors">
          {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </Field>

      {/* Password strength */}
      {form.password && (
        <div className="flex gap-1 -mt-2">
          {[1,2,3,4].map(i => {
            const strength = Math.min(
              (form.password.length >= 8 ? 1 : 0) +
              (/[A-Z]/.test(form.password) ? 1 : 0) +
              (/[0-9]/.test(form.password) ? 1 : 0) +
              (/[^A-Za-z0-9]/.test(form.password) ? 1 : 0),
              4
            )
            return (
              <div key={i} className={`h-1 flex-1 rounded-full transition-all ${
                i <= strength
                  ? strength <= 1 ? 'bg-red-400' : strength === 2 ? 'bg-yellow-400' : strength === 3 ? 'bg-blue-400' : 'bg-green-500'
                  : 'bg-slate-200'
              }`} />
            )
          })}
        </div>
      )}

      <Field label="Xác nhận mật khẩu" icon={Lock} error={errors.confirm}>
        <input
          type={showPw ? 'text' : 'password'}
          placeholder="Nhập lại mật khẩu"
          className={inputCls(true)}
          value={form.confirm}
          onChange={set('confirm')}
          autoComplete="new-password"
        />
      </Field>

      <label className="flex items-start gap-2.5 text-sm text-slate-600 cursor-pointer select-none mt-1">
        <input type="checkbox" required className="w-4 h-4 mt-0.5 accent-blue-600 rounded shrink-0" />
        <span>Tôi đồng ý với <button type="button" className="font-semibold text-blue-600 hover:underline">Điều khoản dịch vụ</button> và <button type="button" className="font-semibold text-blue-600 hover:underline">Chính sách bảo mật</button></span>
      </label>

      <button
        type="submit"
        disabled={submitting}
        className="h-12 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold text-sm shadow-[0_8px_20px_rgba(37,99,235,0.3)] hover:shadow-[0_12px_28px_rgba(37,99,235,0.4)] hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-1"
      >
        {submitting ? <><Loader2 size={16} className="animate-spin" /> Đang tạo tài khoản...</> : 'Tạo tài khoản'}
      </button>

      <p className="text-center text-sm text-slate-500">
        Đã có tài khoản?{' '}
        <button type="button" onClick={onSwitchToLogin} className="font-bold text-blue-600 hover:text-blue-700 hover:underline">
          Đăng nhập
        </button>
      </p>
    </form>
  )
}

import { useState } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { Lock, Eye, EyeOff, ChevronLeft, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { authApi } from '../../services/authApi'

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const email = searchParams.get('email')
  const navigate = useNavigate()

  const [form, setForm] = useState({ password: '', confirm: '' })
  const [showPw, setShowPw] = useState(false)
  const [status, setStatus] = useState('idle') // idle, loading, success, error
  const [errorMsg, setErrorMsg] = useState('')

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!form.password) {
      setStatus('error'); setErrorMsg('Vui lòng nhập mật khẩu mới.'); return
    }
    if (form.password.length < 8) {
      setStatus('error'); setErrorMsg('Mật khẩu phải có ít nhất 8 ký tự.'); return
    }
    if (form.password !== form.confirm) {
      setStatus('error'); setErrorMsg('Mật khẩu xác nhận không khớp.'); return
    }

    setStatus('loading')
    try {
      await authApi.resetPassword({
        email,
        token,
        new_password: form.password,
        confirm_password: form.confirm
      })
      setStatus('success')
    } catch (err) {
      setStatus('error')
      setErrorMsg(err.response?.data?.error || 'Đã xảy ra lỗi khi đặt lại mật khẩu.')
    }
  }

  // Nếu không có token hoặc email trong URL, chặn truy cập
  if (!token || !email) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-200/80 p-8 text-center">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={32} className="text-red-500" />
          </div>
          <h1 className="text-xl font-black text-slate-900 mb-2">Liên kết không hợp lệ</h1>
          <p className="text-sm text-slate-500 mb-6">
            Liên kết đặt lại mật khẩu này không hợp lệ hoặc thiếu thông tin cần thiết. Vui lòng yêu cầu một liên kết mới.
          </p>
          <Link to="/forgot-password" className="inline-flex items-center justify-center w-full h-11 rounded-xl bg-blue-600 text-white font-bold text-sm shadow-md hover:bg-blue-700 transition-all">
            Yêu cầu lại liên kết
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-200/80 p-8 md:p-10">
        
        {/* Nút quay lại */}
        <Link to="/auth" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-blue-600 font-medium transition-colors mb-8">
          <ChevronLeft size={16} />
          Quay lại đăng nhập
        </Link>

        {status === 'success' ? (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-50 border border-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 size={32} className="text-green-600" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 mb-2">Đặt lại thành công!</h1>
            <p className="text-sm text-slate-500 mb-8 leading-relaxed">
              Mật khẩu của bạn đã được thay đổi thành công. Bây giờ bạn có thể đăng nhập bằng mật khẩu mới.
            </p>
            <Link to="/auth" className="inline-flex items-center justify-center w-full h-12 rounded-xl bg-blue-600 text-white font-bold text-sm shadow-[0_8px_20px_rgba(37,99,235,0.25)] hover:bg-blue-700 hover:-translate-y-0.5 transition-all">
              Đăng nhập ngay
            </Link>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-black text-slate-900 mb-2">Tạo mật khẩu mới</h1>
            <p className="text-sm text-slate-500 mb-8 leading-relaxed">
              Vui lòng nhập mật khẩu mới của bạn bên dưới. Hãy chắc chắn rằng nó khó đoán.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {status === 'error' && (
                <div className="flex items-start gap-2.5 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 font-medium">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <p>{errorMsg}</p>
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Mật khẩu mới</label>
                <div className="relative flex items-center rounded-xl border border-slate-200 bg-white focus-within:border-blue-500 focus-within:shadow-[0_0_0_3px_rgba(37,99,235,0.1)] transition-all">
                  <span className="absolute left-3.5 text-slate-400 pointer-events-none">
                    <Lock size={16} />
                  </span>
                  <input
                    type={showPw ? 'text' : 'password'}
                    placeholder="Tối thiểu 8 ký tự"
                    value={form.password}
                    onChange={set('password')}
                    className="w-full h-11 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 outline-none pl-10 pr-11"
                    autoFocus
                  />
                  <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-3.5 text-slate-400 hover:text-slate-600 transition-colors">
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Xác nhận mật khẩu</label>
                <div className="relative flex items-center rounded-xl border border-slate-200 bg-white focus-within:border-blue-500 focus-within:shadow-[0_0_0_3px_rgba(37,99,235,0.1)] transition-all">
                  <span className="absolute left-3.5 text-slate-400 pointer-events-none">
                    <Lock size={16} />
                  </span>
                  <input
                    type={showPw ? 'text' : 'password'}
                    placeholder="Nhập lại mật khẩu mới"
                    value={form.confirm}
                    onChange={set('confirm')}
                    className="w-full h-11 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 outline-none pl-10 pr-4"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={status === 'loading'}
                className="h-12 w-full rounded-xl bg-blue-600 text-white font-bold text-sm shadow-[0_8px_20px_rgba(37,99,235,0.25)] hover:bg-blue-700 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-60 disabled:hover:translate-y-0 flex items-center justify-center gap-2 mt-2"
              >
                {status === 'loading' ? (
                  <><Loader2 size={16} className="animate-spin" /> Đang xử lý...</>
                ) : (
                  'Lưu mật khẩu mới'
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

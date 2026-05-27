import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, ChevronLeft, Send, CheckCircle2, AlertCircle, Loader2, KeyRound } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle') // idle, loading, success, error
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus('error')
      setErrorMsg('Vui lòng nhập một địa chỉ email hợp lệ.')
      return
    }
    
    setStatus('loading')
    // Giả lập gọi API gửi email khôi phục
    setTimeout(() => {
      setStatus('success')
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-200/80 p-8 md:p-10">
        
        {/* Nút quay lại */}
        <Link to="/auth" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-blue-600 font-medium transition-colors mb-8">
          <ChevronLeft size={16} />
          Quay lại đăng nhập
        </Link>

        {/* Biểu tượng */}
        <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-6">
          <KeyRound size={28} className="text-blue-600" />
        </div>

        <h1 className="text-2xl font-black text-slate-900 mb-2">Quên mật khẩu?</h1>
        <p className="text-sm text-slate-500 mb-8 leading-relaxed">
          Đừng lo lắng! Hãy nhập địa chỉ email liên kết với tài khoản của bạn, chúng tôi sẽ gửi một liên kết để đặt lại mật khẩu.
        </p>

        {status === 'success' ? (
          <div className="bg-green-50 rounded-2xl p-6 text-center border border-green-100">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={24} className="text-green-600" />
            </div>
            <h3 className="text-green-800 font-bold mb-2">Đã gửi email khôi phục</h3>
            <p className="text-green-700/80 text-sm mb-6">
              Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu đến email <strong>{email}</strong>. Vui lòng kiểm tra hộp thư đến (và cả mục Spam).
            </p>
            <button 
              onClick={() => { setStatus('idle'); setEmail('') }}
              className="text-sm font-semibold text-green-700 hover:text-green-800 underline"
            >
              Thử lại với email khác
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {status === 'error' && (
              <div className="flex items-start gap-2.5 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 font-medium">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <p>{errorMsg}</p>
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Địa chỉ Email</label>
              <div className="relative flex items-center rounded-xl border border-slate-200 bg-white focus-within:border-blue-500 focus-within:shadow-[0_0_0_3px_rgba(37,99,235,0.1)] transition-all">
                <span className="absolute left-3.5 text-slate-400 pointer-events-none">
                  <Mail size={16} />
                </span>
                <input
                  type="email"
                  placeholder="Nhập email của bạn..."
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setStatus('idle') }}
                  className="w-full h-11 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 outline-none pl-10 pr-4"
                  autoFocus
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={status === 'loading'}
              className="h-12 w-full rounded-xl bg-blue-600 text-white font-bold text-sm shadow-[0_8px_20px_rgba(37,99,235,0.25)] hover:bg-blue-700 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-60 disabled:hover:translate-y-0 flex items-center justify-center gap-2 mt-2"
            >
              {status === 'loading' ? (
                <><Loader2 size={16} className="animate-spin" /> Đang gửi yêu cầu...</>
              ) : (
                <><Send size={16} /> Gửi liên kết khôi phục</>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

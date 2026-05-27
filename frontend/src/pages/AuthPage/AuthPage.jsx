import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { Laptop, Shield, Zap, Star, ChevronLeft } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { LoginForm, RegisterForm } from './components/AuthForms'

/* ─── Decorative left panel ───────────────────────────────────── */
const FEATURES = [
  { icon: Shield, text: 'Bảo mật tài khoản tuyệt đối' },
  { icon: Zap,    text: 'Trải nghiệm mua sắm nhanh hơn' },
  { icon: Star,   text: 'Ưu đãi độc quyền cho thành viên' },
]

function AuthLeftPanel() {
  return (
    <div className="hidden lg:flex flex-col justify-between p-10 xl:p-14 bg-gradient-to-br from-[#0f172a] via-[#1e3a8a] to-[#1d4ed8] text-white relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-80px] right-[-80px] w-[340px] h-[340px] rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute bottom-[-60px] left-[-60px] w-[280px] h-[280px] rounded-full bg-cyan-400/15 blur-3xl" />
        <div className="absolute top-1/2 left-1/3 w-[200px] h-[200px] rounded-full bg-indigo-400/10 blur-2xl" />
      </div>

      {/* Brand */}
      <div className="relative z-10">
        <Link to="/" className="inline-flex flex-col gap-1 group">
          <div className="flex items-end gap-1 text-[1.8rem] font-black tracking-tight leading-none">
            <span className="text-white">LAPTOP</span>
            <span className="bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">DEVICE</span>
          </div>
          <span className="text-blue-300/80 text-xs font-medium">Công nghệ cho cuộc sống</span>
        </Link>
      </div>

      {/* Hero visual */}
      <div className="relative z-10 flex flex-col items-center gap-8 my-8">
        <div className="w-28 h-28 rounded-3xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-2xl">
          <Laptop size={52} className="text-cyan-300" strokeWidth={1.5} />
        </div>
        <div className="text-center">
          <h2 className="text-2xl xl:text-3xl font-black mb-3 leading-tight">
            Chào mừng đến với<br />
            <span className="bg-gradient-to-r from-cyan-300 to-blue-200 bg-clip-text text-transparent">LaptopDevice</span>
          </h2>
          <p className="text-blue-200/80 text-sm leading-relaxed max-w-xs mx-auto">
            Hàng nghìn sản phẩm công nghệ chính hãng, giá tốt nhất thị trường
          </p>
        </div>
      </div>

      {/* Feature list */}
      <div className="relative z-10 flex flex-col gap-4">
        {FEATURES.map(({ icon: Icon, text }) => (
          <div key={text} className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
              <Icon size={16} className="text-cyan-300" />
            </div>
            <span className="text-sm text-blue-100 font-medium">{text}</span>
          </div>
        ))}
        <p className="text-xs text-blue-300/60 mt-2">© 2024 LaptopDevice. All rights reserved.</p>
      </div>
    </div>
  )
}

/* ─── Main AuthPage ───────────────────────────────────────────── */
function AuthPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { isAuthenticated, loading } = useAuth()

  const defaultMode = searchParams.get('mode') === 'register' ? 'register' : 'login'
  const [mode, setMode] = useState(defaultMode)
  const [successMsg, setSuccessMsg] = useState('')

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && isAuthenticated) {
      const redirect = searchParams.get('redirect') || '/'
      navigate(redirect, { replace: true })
    }
  }, [isAuthenticated, loading, navigate, searchParams])

  const handleSuccess = () => {
    const redirect = searchParams.get('redirect') || '/'
    navigate(redirect, { replace: true })
  }

  if (loading) return null // wait for session restore

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center p-4">
      <div className="w-full max-w-5xl min-h-[600px] rounded-3xl shadow-2xl overflow-hidden grid lg:grid-cols-[1fr_1.1fr] bg-white border border-slate-200/80">

        {/* Left — Branding panel */}
        <AuthLeftPanel />

        {/* Right — Form panel */}
        <div className="flex flex-col p-6 sm:p-10 xl:p-12 overflow-y-auto">

          {/* Back to home (mobile only shows, desktop subtle) */}
          <div className="mb-6">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-blue-600 font-medium transition-colors"
            >
              <ChevronLeft size={16} />
              Về trang chủ
            </Link>
          </div>

          {/* Tab switcher */}
          <div className="flex bg-slate-100 rounded-2xl p-1 mb-8 self-start w-full">
            {(['login', 'register'] ).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setSuccessMsg('') }}
                className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-bold transition-all ${
                  mode === m
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {m === 'login' ? 'Đăng nhập' : 'Đăng ký'}
              </button>
            ))}
          </div>

          {/* Heading */}
          <div className="mb-6">
            <h1 className="text-2xl font-black text-slate-900 mb-1">
              {mode === 'login' ? 'Chào mừng trở lại 👋' : 'Tạo tài khoản mới'}
            </h1>
            <p className="text-sm text-slate-500">
              {mode === 'login'
                ? 'Đăng nhập để tiếp tục mua sắm với ưu đãi tốt nhất'
                : 'Tham gia cộng đồng hơn 100.000 khách hàng tin tưởng'}
            </p>
          </div>

          {/* Success message */}
          {successMsg && (
            <div className="mb-4 rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700 font-medium">
              ✅ {successMsg}
            </div>
          )}

          {/* Forms — animated switch */}
          <div className="flex-1">
            {mode === 'login' ? (
              <LoginForm
                onSwitchToRegister={() => setMode('register')}
                onSuccess={handleSuccess}
              />
            ) : (
              <RegisterForm
                onSwitchToLogin={() => setMode('login')}
                onSuccess={handleSuccess}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuthPage

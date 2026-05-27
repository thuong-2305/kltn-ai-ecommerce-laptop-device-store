import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  User, ShieldCheck, Package, ChevronRight, LogOut,
  Camera, AlertCircle, Phone, Mail, MessageCircle,
  Heart, MapPin, Bell, Gift, Star, Settings
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useProfile } from './hooks/useProfile'
import { PersonalInfoTab } from './components/tabs/PersonalInfoTab'
import { SecurityTab } from './components/tabs/SecurityTab'
import { OrdersTab } from './components/tabs/OrdersTab'
import { WishlistTab } from './components/tabs/WishlistTab'
import { AddressTab } from './components/tabs/AddressTab'

/* ─── Nav config ──────────────────────────────────────────────── */
const NAV_GROUPS = [
  {
    heading: 'TÀI KHOẢN CỦA TÔI',
    items: [
      { id: 'info',     label: 'Hồ sơ cá nhân',      icon: User },
      { id: 'orders',   label: 'Đơn hàng của tôi',   icon: Package },
      { id: 'wishlist', label: 'Sản phẩm yêu thích', icon: Heart },
      { id: 'address',  label: 'Số địa chỉ',         icon: MapPin },
      { id: 'notify',   label: 'Thông báo của tôi',   icon: Bell },
      { id: 'voucher',  label: 'Phiếu giảm giá',     icon: Gift },
    ],
  },
  {
    heading: 'CÀI ĐẶT',
    items: [
      { id: 'security', label: 'Bảo mật',      icon: ShieldCheck },
      { id: 'settings', label: 'Cài đặt khác', icon: Settings },
    ],
  },
]

/* ─── Avatar ─────────────────────────────────────────────────── */
function UserAvatar({ profile, size = 'lg' }) {
  const name = profile?.full_name || profile?.username || '?'
  const initials = name.split(' ').slice(-2).map(w => w[0]).join('').toUpperCase().slice(0, 2)
  const sz = size === 'lg' ? 'w-[72px] h-[72px] text-xl' : 'w-10 h-10 text-sm'
  return (
    <div className={`${sz} rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white font-black shadow-md shrink-0 select-none`}>
      {initials}
    </div>
  )
}

/* ─── Quick stat chip ─────────────────────────────────────────── */
function StatChip({ label, value, color = 'blue' }) {
  const colors = {
    blue:   'bg-blue-50  border-blue-100  text-blue-700',
    green:  'bg-green-50 border-green-100 text-green-700',
    amber:  'bg-amber-50 border-amber-100 text-amber-700',
    purple: 'bg-purple-50 border-purple-100 text-purple-700',
  }
  return (
    <div className={`flex flex-col items-center gap-0.5 px-5 py-3 rounded-xl border ${colors[color]}`}>
      <span className="text-xl font-black">{value}</span>
      <span className="text-xs font-semibold whitespace-nowrap">{label}</span>
    </div>
  )
}

/* ─── Skeleton ───────────────────────────────────────────────── */
function Skeleton({ cls }) { return <div className={`animate-pulse bg-slate-200 rounded-xl ${cls}`} /> }

/* ─── Coming-soon tab placeholder ───────────────────────────── */
function ComingSoonTab({ label, icon: Icon }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4 text-slate-400">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
        <Icon size={28} className="text-slate-300" />
      </div>
      <div className="text-center">
        <p className="font-bold text-slate-600 mb-1">{label}</p>
        <p className="text-sm">Tính năng đang được phát triển</p>
        <span className="inline-block mt-3 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-bold">Sắp ra mắt</span>
      </div>
    </div>
  )
}

/* ─── ProfilePage ─────────────────────────────────────────────── */
function ProfilePage() {
  const navigate = useNavigate()
  const { isAuthenticated, loading: authLoading, logout } = useAuth()
  const { profile, loading, error, updateProfile, changePassword } = useProfile()
  const [activeTab, setActiveTab] = useState('info')

  useEffect(() => {
    if (!authLoading && !isAuthenticated) navigate('/auth?redirect=/profile', { replace: true })
  }, [isAuthenticated, authLoading, navigate])

  const handleLogout = async () => { await logout(); navigate('/') }

  if (authLoading) return null

  /* active label */
  const allItems = NAV_GROUPS.flatMap(g => g.items)
  const activeItem = allItems.find(i => i.id === activeTab)

  return (
    <div className="mx-4.5 py-6 pb-16">

      {/* ── Breadcrumb ────────────────────────────────────────── */}
      <nav className="mb-4 flex items-center gap-1.5 text-sm flex-wrap">
        <Link to="/" className="text-slate-500 hover:text-blue-600 font-medium transition-colors">Trang chủ</Link>
        <ChevronRight size={13} className="text-slate-300" />
        <Link to="/profile" className="text-slate-500 hover:text-blue-600 font-medium transition-colors">Tài khoản</Link>
        {activeItem && <>
          <ChevronRight size={13} className="text-slate-300" />
          <span className="text-blue-600 font-semibold">{activeItem.label}</span>
        </>}
      </nav>

      {/* ── Page title ────────────────────────────────────────── */}
      <div className="mb-5">
        <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Tài khoản của tôi</h1>
        <p className="text-slate-500 text-sm mt-0.5">Quản lý thông tin hồ sơ để bảo mật tài khoản</p>
      </div>

      {error && (
        <div className="flex items-center gap-2.5 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 font-medium mb-5">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[288px_1fr] gap-5 items-start">

        {/* ════════════ SIDEBAR ════════════════════════════════ */}
        <aside className="space-y-4 lg:sticky lg:top-24">

          {/* ── User card ──────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Cover gradient */}
            <div className="h-20 bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-400 relative">
              <div className="absolute inset-0 opacity-20"
                style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '30px 30px' }}
              />
            </div>

            <div className="px-5 pb-5">
              {/* Avatar — overlapping cover */}
              <div className="relative -mt-9 mb-3 flex items-end justify-between">
                {loading ? (
                  <div className="w-[72px] h-[72px] rounded-full bg-slate-200 animate-pulse border-4 border-white" />
                ) : (
                  <div className="relative">
                    <div className="border-4 border-white rounded-full shadow-md">
                      <UserAvatar profile={profile} size="lg" />
                    </div>
                    <button
                      className="absolute -bottom-0.5 -right-0.5 w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:border-blue-400 transition-all shadow-sm"
                      title="Thay đổi ảnh (sắp ra mắt)"
                    >
                      <Camera size={11} />
                    </button>
                  </div>
                )}
                {/* Member badge */}
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 text-white text-[10px] font-black shadow-sm">
                  <Star size={9} fill="white" /> THÀNH VIÊN
                </div>
              </div>

              {/* Info */}
              {loading ? (
                <div className="space-y-2">
                  <Skeleton cls="h-4 w-3/4" />
                  <Skeleton cls="h-3 w-full" />
                  <Skeleton cls="h-3 w-1/2" />
                </div>
              ) : profile ? (
                <>
                  <h2 className="font-black text-slate-900 text-[15px] leading-tight">
                    {profile.full_name || profile.username}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5 truncate">{profile.email}</p>
                  <p className="text-xs text-slate-400 mt-0.5">Thành viên từ {profile.date_joined}</p>

                  {/* Quick stats */}
                  <div className="flex gap-2 mt-4">
                    <StatChip label="Đơn hàng" value="3" color="blue" />
                    <StatChip label="Đánh giá" value="1" color="green" />
                    <StatChip label="Voucher" value="2" color="amber" />
                  </div>
                </>
              ) : null}
            </div>
          </div>

          {/* ── Navigation ─────────────────────────────────── */}
          {NAV_GROUPS.map((group) => (
            <div key={group.heading} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50/60">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{group.heading}</span>
              </div>
              {group.items.map((item) => {
                const Icon = item.icon
                const isActive = activeTab === item.id
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold transition-all border-l-[3px] ${
                      isActive
                        ? 'border-l-blue-600 bg-blue-50/70 text-blue-700'
                        : 'border-l-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <Icon size={15} className={isActive ? 'text-blue-600' : 'text-slate-400'} />
                    <span className="flex-1 text-left">{item.label}</span>
                    <ChevronRight size={13} className={isActive ? 'text-blue-400' : 'text-slate-300'} />
                  </button>
                )
              })}
            </div>
          ))}

          {/* ── Cần hỗ trợ thêm? (from TechZone pattern) ──── */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50/60">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">CẦN HỖ TRỢ THÊM?</span>
            </div>
            <div className="p-4 space-y-3">
              <p className="text-xs text-slate-500 leading-relaxed">Đội ngũ LaptopDevice luôn sẵn sàng hỗ trợ bạn 24/7.</p>
              {[
                { icon: Phone, label: 'Hotline: 1900 1234', sub: '(8:00 – 21:00 các ngày)' },
                { icon: Mail,  label: 'support@laptopdevice.vn', sub: 'Phản hồi trong 30 phút' },
                { icon: MessageCircle, label: 'Chat trực tuyến', sub: 'Hỗ trợ nhanh chóng' },
              ].map(({ icon: Icon, label, sub }) => (
                <button key={label} className="w-full flex items-start gap-3 text-left group">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 group-hover:bg-blue-600 transition-colors">
                    <Icon size={14} className="text-blue-600 group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-700 group-hover:text-blue-600 transition-colors">{label}</p>
                    <p className="text-[11px] text-slate-400">{sub}</p>
                  </div>
                </button>
              ))}
            </div>

            {/* Logout */}
            <div className="px-4 pb-4">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-red-200 text-red-600 text-sm font-bold hover:bg-red-50 transition-all"
              >
                <LogOut size={15} />
                Đăng xuất
              </button>
            </div>
          </div>
        </aside>

        {/* ════════════ MAIN CONTENT ════════════════════════════ */}
        <main className="space-y-5">

          {/* ── Section header banner ─────────────────────── */}
          {activeItem && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm px-6 py-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center shrink-0 shadow-sm">
                <activeItem.icon size={22} className="text-white" />
              </div>
              <div>
                <h2 className="font-black text-slate-900 text-lg leading-tight">{activeItem.label}</h2>
                <p className="text-sm text-slate-500 mt-0.5">
                  {activeTab === 'info'     && 'Cập nhật họ tên, email và thông tin liên hệ'}
                  {activeTab === 'orders'   && 'Theo dõi lịch sử và trạng thái đơn hàng'}
                  {activeTab === 'security' && 'Bảo vệ tài khoản với mật khẩu mạnh'}
                  {activeTab === 'wishlist' && 'Danh sách sản phẩm bạn đã lưu yêu thích'}
                  {activeTab === 'address'  && 'Quản lý địa chỉ giao hàng của bạn'}
                  {activeTab === 'notify'   && 'Tùy chỉnh các thông báo bạn nhận được'}
                  {activeTab === 'voucher'  && 'Mã giảm giá và ưu đãi dành cho bạn'}
                  {activeTab === 'settings' && 'Tuỳ chỉnh trải nghiệm cá nhân của bạn'}
                </p>
              </div>
            </div>
          )}

          {/* ── Tab content ────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8 min-h-[380px]">
            {loading ? (
              <div className="space-y-5 animate-pulse">
                <Skeleton cls="h-7 w-1/3" />
                <Skeleton cls="h-4 w-1/2" />
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <Skeleton cls="h-11" /> <Skeleton cls="h-11" />
                </div>
                <Skeleton cls="h-11" />
                <Skeleton cls="h-11" />
                <Skeleton cls="h-11" />
              </div>
            ) : profile ? (
              <>
                {activeTab === 'info'     && <PersonalInfoTab profile={profile} onUpdate={updateProfile} />}
                {activeTab === 'security' && <SecurityTab onChangePassword={changePassword} />}
                {activeTab === 'orders'   && <OrdersTab />}
                {activeTab === 'wishlist' && <WishlistTab />}
                {activeTab === 'address'  && <AddressTab profile={profile} />}
                {activeTab === 'notify'   && <ComingSoonTab label="Thông báo" icon={Bell} />}
                {activeTab === 'voucher'  && <ComingSoonTab label="Ưu đãi & Voucher" icon={Gift} />}
                {activeTab === 'settings' && <ComingSoonTab label="Cài đặt khác" icon={Settings} />}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-60 text-slate-400 gap-3">
                <AlertCircle size={36} />
                <p className="text-sm font-medium">Không tải được thông tin hồ sơ</p>
              </div>
            )}
          </div>

          {/* ── Why trust us strip (from TechZone bottom pattern) */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: '🛡️', label: 'Bảo mật tuyệt đối', sub: 'Mã hoá SSL 256-bit' },
                { icon: '🚚', label: 'Giao hàng nhanh', sub: 'Nhanh nhất 2 giờ' },
                { icon: '↩️', label: 'Đổi trả dễ dàng', sub: 'Trong vòng 30 ngày' },
                { icon: '💬', label: 'Hỗ trợ 24/7', sub: 'Luôn sẵn sàng giúp đỡ' },
              ].map(({ icon, label, sub }) => (
                <div key={label} className="flex items-center gap-3">
                  <span className="text-xl shrink-0">{icon}</span>
                  <div>
                    <p className="text-xs font-bold text-slate-800">{label}</p>
                    <p className="text-[11px] text-slate-500">{sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default ProfilePage

import { useState, useEffect } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import axios from 'axios'
import {
  User, ShieldCheck, Package, ChevronRight, LogOut,
  Camera, AlertCircle, Phone, Mail, MessageCircle,
  Heart, MapPin, Bell, Gift, Star, Settings,
  Shield, Truck, RotateCcw, MessageSquare
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useProfile } from '../../features/profile/hooks/useProfile'
import { PersonalInfoTab } from '../../features/profile/components/tabs/PersonalInfoTab'
import { SecurityTab } from '../../features/profile/components/tabs/SecurityTab'
import { OrdersTab } from '../../features/profile/components/tabs/OrdersTab'
import { WishlistTab } from '../../features/profile/components/tabs/WishlistTab'
import { AddressTab } from '../../features/profile/components/tabs/AddressTab'

/* ─── Nav config ──────────────────────────────────────────────── */
const NAV_GROUPS = [
  {
    heading: 'TÀI KHOẢN CỦA TÔI',
    items: [
      { id: 'info', label: 'Hồ sơ cá nhân', icon: User },
      { id: 'orders', label: 'Đơn hàng của tôi', icon: Package },
      { id: 'wishlist', label: 'Sản phẩm yêu thích', icon: Heart },
      { id: 'address', label: 'Số địa chỉ', icon: MapPin },
      { id: 'notify', label: 'Thông báo của tôi', icon: Bell },
      { id: 'voucher', label: 'Phiếu giảm giá', icon: Gift },
    ],
  },
  {
    heading: 'CÀI ĐẶT',
    items: [
      { id: 'security', label: 'Bảo mật', icon: ShieldCheck },
      { id: 'settings', label: 'Cài đặt khác', icon: Settings },
    ],
  },
]

/* ─── Avatar ─────────────────────────────────────────────────── */
function UserAvatar({ profile, size = 'lg' }) {
  const name = profile?.user?.full_name || profile?.user?.username || '?'
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
    blue: 'bg-blue-50  border-blue-100  text-blue-700',
    green: 'bg-green-50 border-green-100 text-green-700',
    amber: 'bg-amber-50 border-amber-100 text-amber-700',
    purple: 'bg-purple-50 border-purple-100 text-purple-700',
  }
  return (
    <div className={`flex flex-col items-center gap-0.5 py-2.5 rounded-xl border w-full text-center ${colors[color]}`}>
      <span className="text-base md:text-lg font-black">{value}</span>
      <span className="text-[10px] md:text-xs font-semibold whitespace-nowrap">{label}</span>
    </div>
  )
}

/* ─── Skeleton ───────────────────────────────────────────────── */
function Skeleton({ cls }) { return <div className={`animate-pulse bg-slate-200 rounded-xl ${cls}`} /> }

/* ─── NotificationsTab ───────────────────────────────────────── */
function NotificationsTab({ dateJoined }) {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true)
      setError(null)
      try {
        const token = localStorage.getItem('ld_access')
        if (!token) throw new Error('Chưa đăng nhập')
        
        const res = await axios.get('http://localhost:8000/api/payment/orders/history/', {
          headers: { Authorization: `Bearer ${token}` },
          params: { page: page }
        })
        const orders = res.data.results || []
        const count = res.data.count || 0
        setTotalCount(count)
        setTotalPages(Math.ceil(count / 10))
        
        const list = []
        
        orders.forEach(order => {
          const code = order.order_code || order.id
          const date = order.date_ordered
          
          if (order.status === 'pending') {
            list.push({
              id: `order-pending-${order.id}`,
              title: 'Đặt hàng thành công',
              content: `Đơn hàng #${code} đã được đặt thành công. LaptopDevice sẽ sớm liên hệ xác nhận thông tin đơn hàng của bạn.`,
              type: 'pending',
              date: date
            })
          } else if (order.status === 'confirmed') {
            list.push({
              id: `order-confirmed-${order.id}`,
              title: 'Đơn hàng đã được xác nhận',
              content: `Đơn hàng #${code} đã được hệ thống xác nhận thành công và đang chuyển sang khâu đóng gói sản phẩm.`,
              type: 'confirmed',
              date: date
            })
          } else if (order.status === 'shipping') {
            list.push({
              id: `order-shipping-${order.id}`,
              title: 'Đơn hàng đang được giao',
              content: `Đơn hàng #${code} đang trên đường giao tới bạn${order.shipping_tracking_code ? ` (Mã vận đơn GHN: ${order.shipping_tracking_code})` : ''}. Vui lòng chú ý điện thoại để nhận hàng.`,
              type: 'shipping',
              date: order.date_shipped || date
            })
          } else if (order.status === 'delivered') {
            list.push({
              id: `order-delivered-${order.id}`,
              title: 'Đơn hàng giao thành công',
              content: `Đơn hàng #${code} đã được giao thành công! Cảm ơn bạn đã lựa chọn mua sắm tại LaptopDevice. Bạn có thể vào viết đánh giá cho sản phẩm.`,
              type: 'delivered',
              date: order.date_shipped || date
            })
          } else if (order.status === 'cancelled') {
            list.push({
              id: `order-cancelled-${order.id}`,
              title: 'Đơn hàng đã hủy',
              content: `Đơn hàng #${code} đã bị hủy.${order.cancel_reason ? ` Lý do: ${order.cancel_reason}` : ''}`,
              type: 'cancelled',
              date: order.cancelled_at || date
            })
          }
        })
        
        list.sort((a, b) => new Date(b.date) - new Date(a.date))
        
        const isLastPage = page === Math.ceil(count / 10) || count === 0
        if (isLastPage) {
          list.push({
            id: 'welcome-sys',
            title: 'Chào mừng thành viên mới!',
            content: 'Chào mừng bạn gia nhập cộng đồng mua sắm LaptopDevice! Khám phá ngay hàng trăm mẫu laptop chính hãng với ưu đãi đặc quyền dành riêng cho bạn.',
            type: 'welcome',
            date: dateJoined || new Date().toISOString()
          })
        }
        
        setNotifications(list)
      } catch (err) {
        console.error('Error fetching notifications:', err)
        setError('Không thể tải thông báo của bạn. Vui lòng thử lại sau.')
      } finally {
        setLoading(false)
      }
    }

    fetchNotifications()
  }, [page, dateJoined])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 font-semibold text-sm">Đang tải thông báo...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-5 text-center text-red-700 font-bold text-sm">
        {error}
      </div>
    )
  }

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
        <Bell size={40} className="text-slate-300" />
        <p className="font-bold text-slate-650">Bạn chưa có thông báo nào</p>
        <p className="text-xs">Mọi thông báo quan trọng sẽ hiển thị ở đây.</p>
      </div>
    )
  }

  const typeConfig = {
    pending: { bg: 'bg-blue-50 border-blue-100 text-blue-700', icon: Bell },
    confirmed: { bg: 'bg-amber-50 border-amber-100 text-amber-700', icon: Package },
    shipping: { bg: 'bg-indigo-50 border-indigo-100 text-indigo-700', icon: Truck },
    delivered: { bg: 'bg-green-50 border-green-100 text-green-700', icon: Shield },
    cancelled: { bg: 'bg-red-50 border-red-100 text-red-700', icon: AlertCircle },
    welcome: { bg: 'bg-purple-50 border-purple-100 text-purple-700', icon: Gift }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {notifications.map((n) => {
          const cfg = typeConfig[n.type] || typeConfig.pending
          const Icon = cfg.icon
          return (
            <div key={n.id} className={`p-4 md:p-5 rounded-2xl border ${cfg.bg} flex gap-4 transition-all hover:shadow-sm`}>
              <div className="w-10 h-10 rounded-xl bg-white/80 flex items-center justify-center shrink-0 shadow-sm border border-slate-100">
                <Icon size={18} className="shrink-0" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-4 flex-wrap mb-1">
                  <h4 className="text-sm font-bold text-slate-800 leading-tight">{n.title}</h4>
                  <span className="text-[10px] text-slate-450 font-semibold">
                    {n.date ? new Date(n.date).toLocaleString('vi-VN') : ''}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{n.content}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
          >
            Trước
          </button>
          <span className="text-xs text-slate-500 font-bold">
            Trang {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
          >
            Sau
          </button>
        </div>
      )}
    </div>
  )
}

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
  const location = useLocation()
  const { isAuthenticated, loading: authLoading, logout } = useAuth()
  const { profile, loading, error, updateProfile, changePassword } = useProfile()
  const [activeTab, setActiveTab] = useState('info')

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const tabParam = params.get('tab')
    if (tabParam) {
      setActiveTab(tabParam)
    } else if (location.state && location.state.activeTab) {
      setActiveTab(location.state.activeTab)
    }
  }, [location])

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
                    {profile.user?.full_name || profile.user?.username}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5 truncate">{profile.user?.email}</p>
                  <p className="text-xs text-slate-400 mt-0.5">Thành viên từ {profile.user?.date_joined ? new Date(profile.user.date_joined).toLocaleDateString('vi-VN') : ''}</p>

                  {/* Quick stats */}
                  <div className="grid grid-cols-3 gap-2 mt-4 w-full">
                    <StatChip label="Đơn hàng" value={profile.order_count ?? 0} color="blue" />
                    <StatChip label="Đánh giá" value={profile.review_count ?? 0} color="green" />
                    <StatChip label="Voucher" value={profile.voucher_count ?? 0} color="amber" />
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
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold transition-all border-l-[3px] ${isActive
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

          {/* ── Cần hỗ trợ thêm? ──── */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50/60">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">CẦN HỖ TRỢ THÊM?</span>
            </div>
            <div className="p-4 space-y-3">
              <p className="text-xs text-slate-500 leading-relaxed">Đội ngũ LaptopDevice luôn sẵn sàng hỗ trợ bạn 24/7.</p>
              {[
                { icon: Phone, label: 'Hotline: 1900 1234', sub: '(8:00 – 21:00 các ngày)' },
                { icon: Mail, label: 'support@laptopdevice.vn', sub: 'Phản hồi trong 30 phút' },
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
                  {activeTab === 'info' && 'Cập nhật họ tên, email và thông tin liên hệ'}
                  {activeTab === 'orders' && 'Theo dõi lịch sử và trạng thái đơn hàng'}
                  {activeTab === 'security' && 'Bảo vệ tài khoản với mật khẩu mạnh'}
                  {activeTab === 'wishlist' && 'Danh sách sản phẩm bạn đã lưu yêu thích'}
                  {activeTab === 'address' && 'Quản lý địa chỉ giao hàng của bạn'}
                  {activeTab === 'notify' && 'Tùy chỉnh các thông báo bạn nhận được'}
                  {activeTab === 'voucher' && 'Mã giảm giá và ưu đãi dành cho bạn'}
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
                 {activeTab === 'info' && <PersonalInfoTab profile={profile} onUpdate={updateProfile} />}
                {activeTab === 'security' && <SecurityTab onChangePassword={changePassword} />}
                {activeTab === 'orders' && <OrdersTab />}
                {activeTab === 'wishlist' && <WishlistTab />}
                {activeTab === 'address' && <AddressTab profile={profile} />}
                {activeTab === 'notify' && <NotificationsTab dateJoined={profile.user?.date_joined} />}
                {activeTab === 'voucher' && <ComingSoonTab label="Ưu đãi & Voucher" icon={Gift} />}
                {activeTab === 'settings' && <ComingSoonTab label="Cài đặt khác" icon={Settings} />}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-60 text-slate-400 gap-3">
                <AlertCircle size={36} />
                <p className="text-sm font-medium">Không tải được thông tin hồ sơ</p>
              </div>
            )}
          </div>

          {/* ── Why trust us strip (from LaptopDevice bottom pattern) */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: Shield, label: 'Bảo mật tuyệt đối', sub: 'Mã hoá SSL 256-bit' },
                { icon: Truck, label: 'Giao hàng nhanh', sub: 'Nhanh nhất 2 giờ' },
                { icon: RotateCcw, label: 'Đổi trả dễ dàng', sub: 'Trong vòng 30 ngày' },
                { icon: MessageSquare, label: 'Hỗ trợ 24/7', sub: 'Luôn sẵn sàng giúp đỡ' },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                    <Icon size={16} />
                  </div>
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
